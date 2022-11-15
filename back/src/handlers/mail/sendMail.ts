import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult
} from "aws-lambda";
import { SES } from 'aws-sdk';

const ses = new SES({ region: "us-west-3" });

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

    var params = {
        Destination: {
            ToAddresses: ["anotherserverlessexample@gmail.com"],
        },
        Message: {
            Body: {
                Text: { Data: data.mail.body },
            },

            Subject: { Data: data.mail.title },
        },
        Source: data.mail.email,
    };

    let response = null;
    try {
        await ses.sendEmail(params);
        response = {
            statusCode: 200,
            body: "SUCCESS",
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS 
            }
        };
    } catch (err) {
        console.error(err)
        response = {
            statusCode: 500,
            body: "ERROR",
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS 
            }
        };
    }

    return response;
}