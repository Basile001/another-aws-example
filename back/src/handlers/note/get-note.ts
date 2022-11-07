import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult
} from "aws-lambda";
import { DynamoDBClient, GetItemCommand, GetItemCommandInput } from "@aws-sdk/client-dynamodb";
import jwt_decode from "jwt-decode";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-3" });

// Get the DynamoDB table name from environment variables
const tableName = process.env.NOTE_TABLE;

exports.getNoteHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { httpMethod, pathParameters, headers } = event;
    if (httpMethod !== 'GET') {
        throw new Error(`getMethod only accept GET method, you tried: ${httpMethod}`);
    }

    const jwt: any = jwt_decode(headers.Authorization);

    const { id } = pathParameters;

    const params: GetItemCommandInput = {
        TableName: tableName,
        Key: marshall({
            id: id,
            userId: jwt['cognito:username']
        })
    };

    let response = null;
    try {
        const result = await client.send(new GetItemCommand(params));
        if (result.Item) {
            response = {
                statusCode: 200,
                body: JSON.stringify(unmarshall(result.Item)),
                headers: {
                    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                    "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS 
                }
            };
        }
        else {
            response = {
                statusCode: 404,
                body: "ERROR",
                headers: {
                    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                    "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS 
                }
            };
        }
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