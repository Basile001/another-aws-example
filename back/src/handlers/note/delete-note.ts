import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult
} from "aws-lambda";
import { DynamoDBClient, DeleteItemCommand, DeleteItemCommandInput } from "@aws-sdk/client-dynamodb";
import { jwtDecode } from "jwt-decode";
import { marshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-3" });

// Get the DynamoDB table name from environment variables
const tableName = process.env.NOTE_TABLE;

exports.deleteNoteHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { httpMethod, pathParameters, headers } = event;
    if (httpMethod !== 'DELETE') {
        throw new Error(`getMethod only accept GET method, you tried: ${httpMethod}`);
    }

    const jwt: any = jwtDecode(headers.Authorization);

    const { id } = pathParameters;

    const params: DeleteItemCommandInput = {
        TableName: tableName,
        Key: marshall({
            id: id,
            userId: jwt['cognito:username']
        })
    }

    let response = null;
    try {
        const result = await client.send(new DeleteItemCommand(params));
        if (result) {
            response = {
                statusCode: 200,
                body: JSON.stringify(result),
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