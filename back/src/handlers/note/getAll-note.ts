import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult
} from "aws-lambda";
import { DynamoDBClient, QueryCommand, QueryCommandInput } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import jwt_decode from "jwt-decode";


const client = new DynamoDBClient({ region: "eu-west-3" });

// Get the DynamoDB table name from environment variables
const tableName = process.env.NOTE_TABLE;

exports.getAllNoteHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { httpMethod, path, headers } = event;
    if (httpMethod !== 'GET') {
        throw new Error(`getMethod only accept GET method, you tried: ${httpMethod}`);
    }

    const jwt: any = jwt_decode(headers.Authorization);

    const params: QueryCommandInput = {
        TableName: tableName,
        IndexName: 'userIdIndex',
        ExpressionAttributeValues: { ':user': { 'S': jwt['cognito:username'] } },
        KeyConditionExpression: `userId = :user`,
        ProjectionExpression: "id, #v_name, description",
        ExpressionAttributeNames: { "#v_name": "name" }
    }

    let response = null;
    try {
        const result = await client.send(new QueryCommand(params));
        response = {
            statusCode: 200,
            body: JSON.stringify(result.Items.map((res) => unmarshall(res))),
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS 
            }
        };
    } catch (err) {
        console.error(err);
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