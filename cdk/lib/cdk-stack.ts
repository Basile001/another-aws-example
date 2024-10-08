import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager'
import { App, CfnParameter, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Resource } from 'aws-cdk-lib/aws-apigateway';


export class CdkStack extends Stack {
    constructor(scope: App, id: string, props: StackProps) {
        super(scope, id, props);

        new CfnParameter(this, 'AppId');

        const stage = process.env.STAGE === "prod" ? "" : `-${process.env.STAGE}`;

        /**WEB STATIICS + DIST */
        //S3 static files
        const myBucket = new s3.Bucket(this, `another-serverless-example-static-bucket${stage}`, {
            publicReadAccess: true,
            removalPolicy: RemovalPolicy.DESTROY,
            websiteIndexDocument: "index.html",
            bucketName: `${process.env.S3_STATIC_BUCKET}`,
            blockPublicAccess: new s3.BlockPublicAccess({
                blockPublicAcls: false,
                blockPublicPolicy: false,
                ignorePublicAcls: false,
                restrictPublicBuckets: false
            }),
        });


        let distributionDomainName = "";
        if (process.env.STAGE === "prod") {
            const publicHostedZone = new route53.PublicHostedZone(this, 'ASEHostedZone', {
                zoneName: 'anotherserverlessexample.com',
            });

            const aseCertificate = certificatemanager.Certificate.fromCertificateArn(this, 'Certificate', process.env.CERTIFICATE_ARN + "");

            const myCloudfront = new cloudfront.Distribution(this, `another-serverless-example-dist${stage}`, {
                defaultBehavior: {
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    origin: new origins.S3Origin(myBucket),
                },
                enableIpv6: true,
                certificate: aseCertificate,
                domainNames: ['anotherserverlessexample.com']
            });

            new route53.AaaaRecord(this, 'Alias', {
                zone: publicHostedZone,
                target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(myCloudfront)),
            });

            new route53.ARecord(this, 'ARecord', {
                zone: publicHostedZone,
                target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(myCloudfront)),
            });

            distributionDomainName = 'anotherserverlessexample.com';
        } else {
            const myCloudfront = new cloudfront.Distribution(this, `another-serverless-example-dist${stage}`, {
                defaultBehavior: {
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    origin: new origins.S3Origin(myBucket),
                },
                enableIpv6: true
            });
            distributionDomainName = myCloudfront.distributionDomainName;
        }

        /** DATABASE */
        // DynamoDB table to store item: {id: <ID>, name: <NAME>}
        const noteTable = new dynamodb.Table(this, `NoteTable${stage}`, {
            tableName: `ASE-note${stage}`,
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
            readCapacity: 1,
            writeCapacity: 1,

        });

        noteTable.addGlobalSecondaryIndex({
            indexName: 'userIdIndex',
            partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
            readCapacity: 1,
            writeCapacity: 1,
            projectionType: dynamodb.ProjectionType.ALL,
        })

        const environment = { NOTE_TABLE: noteTable.tableName };

        /**SERVICES */
        // The code will be uploaded to this location during the pipeline's build step
        const artifactBucket = s3.Bucket.fromBucketName(this, 'ArtifactBucket', process.env.S3_BUCKET!);

        ////////////*************NOTE*******************////////////////
        let artifactKey = `${process.env.CODEBUILD_BUILD_ID}/bin/create-note.zip`;
        let code = lambda.Code.fromBucket(artifactBucket, artifactKey);
        const createNoteFunction = new lambda.Function(this, `createNote${stage}`, {
            functionName: `createNote${stage}`,
            description: 'Create a new note',
            handler: 'src/handlers/create-note.createNoteHandler',
            runtime: lambda.Runtime.NODEJS_LATEST,
            code,
            timeout: Duration.seconds(5),
            environment,
        });
        noteTable.grantReadWriteData(createNoteFunction);

        artifactKey = `${process.env.CODEBUILD_BUILD_ID}/bin/update-note.zip`;
        code = lambda.Code.fromBucket(artifactBucket, artifactKey);
        const updateNoteFunction = new lambda.Function(this, `updateNote${stage}`, {
            functionName: `updateNote${stage}`,
            description: 'Update an existing note',
            handler: 'src/handlers/update-note.updateNoteHandler',
            runtime: lambda.Runtime.NODEJS_LATEST,
            code,
            timeout: Duration.seconds(5),
            environment,
        });
        noteTable.grantReadWriteData(updateNoteFunction);

        artifactKey = `${process.env.CODEBUILD_BUILD_ID}/bin/delete-note.zip`;
        code = lambda.Code.fromBucket(artifactBucket, artifactKey);
        const deleteNoteFunction = new lambda.Function(this, `deleteNote${stage}`, {
            functionName: `deleteNote${stage}`,
            description: 'Delete an existing note',
            handler: 'src/handlers/delete-note.deleteNoteHandler',
            runtime: lambda.Runtime.NODEJS_LATEST,
            code,
            timeout: Duration.seconds(5),
            environment,
        });
        noteTable.grantReadWriteData(deleteNoteFunction);

        artifactKey = `${process.env.CODEBUILD_BUILD_ID}/bin/deleteAll-note.zip`;
        code = lambda.Code.fromBucket(artifactBucket, artifactKey);
        const deleteAllNoteFunction = new lambda.Function(this, `deleteAllNote${stage}`, {
            functionName: `deleteAllNote${stage}`,
            description: 'Delete all existing notes',
            handler: 'src/handlers/deleteAll-note.deleteAllNoteHandler',
            runtime: lambda.Runtime.NODEJS_LATEST,
            code,
            timeout: Duration.seconds(5),
            environment,
        });
        noteTable.grantReadWriteData(deleteAllNoteFunction);

        artifactKey = `${process.env.CODEBUILD_BUILD_ID}/bin/get-note.zip`;
        code = lambda.Code.fromBucket(artifactBucket, artifactKey);
        const getNoteFunction = new lambda.Function(this, `getNote${stage}`, {
            functionName: `getNote${stage}`,
            description: 'get an existing note',
            handler: 'src/handlers/get-note.getNoteHandler',
            runtime: lambda.Runtime.NODEJS_LATEST,
            code,
            timeout: Duration.seconds(5),
            environment,
        });
        noteTable.grantReadData(getNoteFunction);

        artifactKey = `${process.env.CODEBUILD_BUILD_ID}/bin/getAll-note.zip`;
        code = lambda.Code.fromBucket(artifactBucket, artifactKey);
        const getAllNoteFunction = new lambda.Function(this, `getAllNote${stage}`, {
            functionName: `getAllNote${stage}`,
            description: 'get all existing notes for a user',
            handler: 'src/handlers/getAll-note.getAllNoteHandler',
            runtime: lambda.Runtime.NODEJS_LATEST,
            code,
            timeout: Duration.seconds(5),
            environment,
        });
        noteTable.grantReadData(getAllNoteFunction);

        artifactKey = `${process.env.CODEBUILD_BUILD_ID}/bin/sendMail.zip`;
        code = lambda.Code.fromBucket(artifactBucket, artifactKey);
        const sendMailFunction = new lambda.Function(this, `sendMail${stage}`, {
            functionName: `sendMail${stage}`,
            description: 'Send an email to the creator of ASE',
            handler: 'src/handlers/sendMail.sendMailHandler',
            runtime: lambda.Runtime.NODEJS_LATEST,
            code,
            timeout: Duration.seconds(5),
            environment,
        });
        sendMailFunction.addToRolePolicy(new iam.PolicyStatement({
            actions: ['ses:SendEmail', 'SES:SendRawEmail'],
            resources: ['*'],
            effect: iam.Effect.ALLOW,
        }));


        /**USERS */
        const cognitoUserPool = new cognito.UserPool(this, `another-serverless-example-userpool${stage}`, {
            userPoolName: `another-serverless-example-userpool${stage}`,
            selfSignUpEnabled: true,
            userVerification: {
                emailSubject: 'Verify your email for Another serverless example!',
                emailBody: 'Hello {username}, Thanks for signing up to our Another serverless example app! Your verification link is {##Verify Email##}',
                emailStyle: cognito.VerificationEmailStyle.LINK
            },
            signInAliases: {
                username: true,
                email: true,
            },
            standardAttributes: {
                address: {
                    required: false,
                    mutable: true
                },
                email: {
                    required: true,
                    mutable: true
                },
                birthdate: {
                    required: false,
                    mutable: true
                }
            },
            email: cognito.UserPoolEmail.withCognito('noreply@anotherserverlessexample.com'), //maybe improve with SES services
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY
        });

        const client = cognitoUserPool.addClient(`another-serverless-example-app-client${stage}`, {
            userPoolClientName: `another-serverless-example-app-client${stage}`,
            oAuth: {
                flows: {
                    authorizationCodeGrant: true,
                    implicitCodeGrant: true
                },
                scopes: [cognito.OAuthScope.OPENID],
                callbackUrls: [`https://${distributionDomainName}/dashboard`],
                logoutUrls: [`https://${distributionDomainName}/login`],
            },
            authFlows: {
                userPassword: true,
                userSrp: true
            },
            supportedIdentityProviders: [
                cognito.UserPoolClientIdentityProvider.COGNITO,
            ],
        });

        cognitoUserPool.addDomain(`ase-cognitoDomain${stage}`, {
            cognitoDomain: {
                domainPrefix: `anotherserverless-example${stage}`,
            },
        });

        //TODO add identity providers

        /**API */
        const allowOrigins = process.env.STAGE === 'prod' ? [`https://${distributionDomainName}`] : [`https://${distributionDomainName}`, 'http://localhost:3000']
        const api = new apigateway.RestApi(this, `another-serverless-example-restapi${stage}`, {
            restApiName: `another-serverless-example-restapi${stage}`,
            cloudWatchRole: false,
            defaultCorsPreflightOptions: {
                allowHeaders: [
                    'Content-Type',
                    'X-Amz-Date',
                    'Authorization',
                    'X-Api-Key'
                ],
                allowOrigins: allowOrigins,
                allowMethods: ['GET', 'PUT', 'POST', 'OPTIONS', 'DELETE'],
                allowCredentials: true
            }
        });

        //Usage plan 
        const plan = api.addUsagePlan(`another-serverless-example-usage-plan${stage}`, {
            name: `another-serverless-example-usage-plan${stage}`,
            throttle: {
                rateLimit: 50,
                burstLimit: 10
            }
        });

        const key = api.addApiKey(process.env.API_KEY + "");
        plan.addApiKey(key);


        const auth = new apigateway.CognitoUserPoolsAuthorizer(this, `another-serverless-example-authorizer${stage}`, {
            cognitoUserPools: [cognitoUserPool]
        });

        const noteEndpoint: Resource = api.root.addResource("note");
        noteEndpoint.addMethod('POST', new apigateway.LambdaIntegration(createNoteFunction), {
            authorizer: auth,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
        noteEndpoint.addMethod('GET', new apigateway.LambdaIntegration(getAllNoteFunction), {
            authorizer: auth,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
        noteEndpoint.addMethod('DELETE', new apigateway.LambdaIntegration(deleteAllNoteFunction), {
            authorizer: auth,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        const noteIdEndpoint: Resource = noteEndpoint.addResource('{id}');
        noteIdEndpoint.addMethod('PUT', new apigateway.LambdaIntegration(updateNoteFunction), {
            authorizer: auth,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
        noteIdEndpoint.addMethod('DELETE', new apigateway.LambdaIntegration(deleteNoteFunction), {
            authorizer: auth,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
        noteIdEndpoint.addMethod('GET', new apigateway.LambdaIntegration(getNoteFunction), {
            authorizer: auth,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        api.root.addResource("send").addMethod('POST', new apigateway.LambdaIntegration(sendMailFunction));


    }
}
