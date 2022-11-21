import { Box, Container, CssBaseline, Typography } from "@mui/material";
import React from "react";



const BlogPage: React.FC = () => {

    return <Container component="main" maxWidth="lg">
        <CssBaseline />
        <Box
            sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Typography component="h1" variant="h3">
                Blog: How I built a serverless app using AWS services
            </Typography>
            <Typography component="h1" variant="h5" sx={{ marginTop: 3 }}>
                INTRODUCTION
            </Typography>
            <Typography variant="body1" sx={{ marginTop: 1 }}>
                Hello,
            </Typography>
            <Typography variant="body1" sx={{ marginTop: 2, textAlign: "justify", textIndent: 30 }} >
                Before to explain the technologies behind Another Serverless Example (ASE), let me introduce myself and the reason of the project. I am a software developer living in France,
                during my past experience I worked on projects using AWS services. I was interested enough in cloud technologies that I decided to learn and pass the AWS developer
                and AWS solution architect certifications during my free time in 2021. My mission changes during years 2021 - 2022, and I worked on others on premise projects. Then I decided
                to quit my job and do personnal things I wanted to realize. In these personnal things there are computing projects, apps which I wanted to code and release. I started from zero with a freshly created
                AWS account and I start coding, bulding pipelines, creating frontend interfaces and learning a lot in the process. With AWS certifications in my pocket, I know the theory of serverless application pretty well, however
                there is a gap between theory and practice in computing. Coding is not easy and it's time consuming, we often have doubts and questions. Is my choice the right one? Isn't there a better solution? The more I advanced
                in the architecture of my project, the more I intended to put the architecture of my application in open source. Firstly to share with others developers my work, if ASE can help someone,
                a company or a student to build an app I will be please. Secondly to have feedback, maybe someone will see something wrong in my stack or just give me an advice.
                Don't give me wrong, there is a lot to improve in this project but I don't have enough time to do it perfectly.
                <br /> <br />
                In the following article we will discuss about the technique of the project, what I've done, what difficulties I encountered and what can be improve.
            </Typography>
            <Typography component="h1" variant="h5" sx={{ marginTop: 3 }}>
                QUICK PRESENTATION OF THE CODE
            </Typography>
            <Typography variant="body1" sx={{ marginTop: 2, textAlign: "justify", textIndent: 30 }} >
                The application is coded in typescript, it uses mainly react for the frontend and AWS lambda for the backend. The AWS stack is described with CDK, you can check the code in github. There are few things that I didn't
                succeed to implement in CDK code, all these missing blocks are explained in the page. The project was initialized by using the application creation in AWS lambda console. It creates the first pipeline
                and codebuild configuration, the cdk project, api gateway, a dynamodb table and three lambda examples. As things progress I add a bunch of services in the stack as for example a S3 for static files and a cloudfront distribution.<br />
                Since the creation of the project by AWS, I removed the permission boundary and try to simplify IAM policies. I understand IAM policies and permissions boundaries are important concepts, but in my case
                and because I'm alone on the project it was more blocking than facilitating.
            </Typography>
            <Typography component="h1" variant="h5" sx={{ marginTop: 3 }}>
                CODE PIPELINE / CODEBUILD
            </Typography>
            <Typography variant="body1" sx={{ marginTop: 2, textAlign: "justify", textIndent: 30 }} >
                Later I create 3 pipelines based on the one created by AWS, each one for a specific environment prod, preprod and dev:
            </Typography>
            <img src={require('../resources/jpg/pipelines.JPG')} alt="pipelines" title="pipelines"></img>
            <Typography variant="body1" sx={{ marginTop: 2, textAlign: "justify", textIndent: 30 }} >
                I manually configured the pipelines by using the AWS console. I kept the three steps in each pipelines: source, build and deploy. <br /> The first step does a checkout of the code with AWS codestar.
                For the production and pre-production pipeline codestar is plugged in the master branch of my github repository, the develop pipeline is plugged in the develop branch of my repository. Both develop and preprod pipelines
                are triggered when the branch is updated in contrary of production which is triggered mannualy.
                <br />
                The second step is the codebuild runner. Codebuild environment variables differ according to the pipeline. Here a list of the variables and where there are used: <br />
                <ul>
                    <li>S3_BUCKET: The S3 bucket where the built code is stored. Used by CDK and buildspec.yml</li>
                    <li>APP_ID: The app id. Used by CDK to identify the app</li>
                    <li>S3_STATIC_BUCKET: The static bucket of the apps, where static files are copied</li>
                    <li>CLOUDFRONT_DIST_ID: The cloudfront distribution ID, used to invalidate the cache after S3 deployment</li>
                    <li>STAGE: Tag to know in which environment we worked</li>
                    <li>API_KEY: A random string used in CDK for API usage plan, check code for more information</li>
                </ul>
            </Typography>
            <img src={require('../resources/jpg/codebuildenv.JPG')} alt="codebuild env" title="Codebuild environment"></img>
            <Typography variant="body1" sx={{ marginTop: 2, textAlign: "justify", textIndent: 30 }} >
                The third step is the deployment of the stack. It generate the cloudformation template and deploy the stack, I let you with a screenshot of the pipelines.
            </Typography>
            <img src={require('../resources/jpg/pipelinestep.JPG')} alt="pipeline screen" title="Pipeline steps" sizes=""></img>
            <Typography component="h1" variant="h5" sx={{ marginTop: 3 }}>
                KNOWN PIPELINES ISSUES AND HOW TO IMPROVE THEM:
            </Typography>
            <Typography variant="body1" sx={{ marginTop: 2, textAlign: "justify", textIndent: 30 }} >
                My AWS cloudformation serverless repository created by AWS drifted a lot during the life of my project. I didn't see or realize the cloudformation stack for my pipelines / codebuild and policies until the near end of the
                project. Something I need to improve in my futur projects. <br />
                Another problem is the copy of my static files and the invalidation of the Cloudfront cache done in my buildspec.yml. When the cloud formation stack is already deployed, my S3 and my distribution already
                exist, so there is no problem. But when I decided to create new stack for dev or preprod environment the pipelines failed. To improve I need to move the buildspec post build command after the execution of the changeset in the pipeline rather than
                in the buildspec.
            </Typography>
            <Typography component="h1" variant="h5" sx={{ marginTop: 3 }}>
                ROUTE53, DOMAIN AND CERTIFICATE
            </Typography>
            <Typography variant="body1" sx={{ marginTop: 2, textAlign: "justify", textIndent: 30 }} >
                What come next is a list of configuration which I did without the help of CDK. Some of them were done in purpose like the domain registration and SES configuration, others like certificate creation and
                the attribution of a domain name to cloudfront were done manually due to the failure of their implementation.<br />
                Firstly I manually registered the domain of the application, the AWS wizard was pretty straight forward here:
            </Typography>
            <img src={require('../resources/jpg/domain.JPG')} alt="domain" title="Domain"></img>
            <Typography variant="body1" sx={{ marginTop: 2, textAlign: "justify", textIndent: 30 }} >
                I created a hosted zone using CDK with the AAAA record pointing to the cloudfront distribution. For your information, if you create a AAAA record your cloudfront distribution must have IPv6 activated.
                I advise you also to check if the name servers of your hosted zone match your domain server names list, I manually change the domain server names list after the execution of the changeset.
            </Typography>
            <img src={require('../resources/jpg/hostedzone.JPG')} alt="hosted zone" title="Hosted zone"></img>
            <Typography variant="body1" sx={{ marginTop: 2, textAlign: "justify", textIndent: 30 }} >
                I manually create a certificate in us-east-1 for cloudfront. It is mandatory to create a cloudfront certificate in us-east-1 even if your stack is in another region, my stack for example is in eu-west-3.
                For the little story here, I had at first try to create the certificate with CDK (check the commented code in cdk-stack.ts on github) but it failed during the generation of the changeset, I never found why.
            </Typography>
            <img src={require('../resources/jpg/certificate1.JPG')} alt="certificate" title="Certificate"></img>
            <Typography variant="body1" sx={{ marginTop: 2, textAlign: "justify", textIndent: 30 }} >
                To issue your certificate you need to create CNAME record of your certificate in the hosted zone:
            </Typography>
            <img src={require('../resources/jpg/CertificateCreateRecord.JPG')} alt="CCR" title="Certificate create record"></img>
            <Typography variant="body1" sx={{ marginTop: 2, textAlign: "justify", textIndent: 30 }} >
                Then add domain and certificate to your cloudfront configuration:
            </Typography>
            <img src={require('../resources/jpg/cloudfront.JPG')} alt="cloudfront" title="Cloudfront manual configuration"></img>
            <Typography component="h1" variant="h5" sx={{ marginTop: 3 }}>
                SES CONFIGURATION
            </Typography>
            <Typography variant="body1" sx={{ marginTop: 2, textAlign: "justify", textIndent: 30 }} >
                I set up a SES configuration quickly at the end of my project in order to add the "contact me" option in case of user support:
            </Typography>
            <img src={require('../resources/jpg/SES.JPG')} alt="ses" title="SES"></img>
            <Typography variant="body1" sx={{ marginTop: 2, textAlign: "justify", textIndent: 30 }} >
                Add records to your hosted zone for the system to work properly:
            </Typography>
            <img src={require('../resources/jpg/SESConfig1.JPG')} alt="SES domain configuration" title="SES domain configuration"></img>
            <Typography component="h1" variant="h5" sx={{ marginTop: 3 }}>
                CONCLUSION
            </Typography>
            <Typography variant="body1" sx={{ marginTop: 2, textAlign: "justify", textIndent: 30 }} >
                Well, this article is finally more a documentation than a blog but nevertheless I think it has his utility. For me it put an end to the project and let a trace of what I've done and learned. Does my AWS journey is over?
                No it isn't and I hope it will continue.
                <br /><br /> Basile GRANDPERRET
            </Typography>
        </Box>
    </Container>
}

export default BlogPage;