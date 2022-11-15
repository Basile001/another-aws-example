import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult
} from "aws-lambda";
//import { SES } from 'aws-sdk';
import { SESClient, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: "eu-west-3" });

exports.sendMailHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { httpMethod, body } = event;
    if (httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${httpMethod} method.`);
    }

    let data = null;
    try {
        data = JSON.parse(body);
    } catch (e) {
        data = body;
    }

    var params: SendEmailCommandInput = {
        Destination: {
            ToAddresses: ["anotherserverlessexample@gmail.com"],
        },
        Message: {
            Body: {
                Text: { Data: `${data.mail.body}\n\nFrom: ${data.mail.email}` },
            },

            Subject: { Data: data.mail.title },
        },
        Source: "support@anotherserverlessexample.com",
    };

    try {
        const result = await sesClient.send(new SendEmailCommand(params));
        console.log(result);
        return {
            statusCode: 200,
            body: "SUCCESS",
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS 
            }
        };
    } catch (err) {
        console.error(err, err.stack);
        return {
            statusCode: 500,
            body: "ERROR",
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS 
            }
        };
    }
}