import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult
} from "aws-lambda";
import { DynamoDBClient, BatchWriteItemCommand, BatchWriteItemCommandInput, QueryCommandInput, QueryCommand } from "@aws-sdk/client-dynamodb";
import jwt_decode from "jwt-decode";

const client = new DynamoDBClient({ region: "eu-west-3" });

// Get the DynamoDB table name from environment variables
const tableName = process.env.NOTE_TABLE;

exports.deleteAllNoteHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { httpMethod, headers } = event;
    if (httpMethod !== 'DELETE') {
        throw new Error(`getMethod only accept GET method, you tried: ${httpMethod}`);
    }

    const jwt: any = jwt_decode(headers.Authorization);

    const paramsGet: QueryCommandInput = {
        TableName: tableName,
        IndexName: 'userIdIndex',
        ExpressionAttributeValues: { ':user': { 'S': jwt['cognito:username'] } },
        KeyConditionExpression: `userId = :user`,
        ProjectionExpression: "id"
    }

    let response = null;
    try {
        const resultGet = await client.send(new QueryCommand(paramsGet));

        const params: BatchWriteItemCommandInput = {
            RequestItems: {
                [tableName]: resultGet.Items.map((res) => {
                    return {
                        DeleteRequest: {
                            Key: {
                                id:
                                    res.id
                            }
                        }
                    }
                })
            }
        }
        const result = await client.send(new BatchWriteItemCommand(params));
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