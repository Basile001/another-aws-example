import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult
} from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand, UpdateItemCommandInput } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { jwtDecode } from "jwt-decode";


const client = new DynamoDBClient({ region: "eu-west-3" });

// Get the DynamoDB table name from environment variables
const tableName = process.env.NOTE_TABLE;

exports.updateNoteHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { httpMethod, body, headers, pathParameters } = event;
    if (httpMethod !== 'PUT') {
        throw new Error(`postMethod only accepts POST method, you tried: ${httpMethod} method.`);
    }

    const jwt: any = jwtDecode(headers.Authorization);

    let data = null;
    try {
        data = JSON.parse(body);
    } catch (e) {
        data = body;
    }

    const { id } = pathParameters;

    const params: UpdateItemCommandInput = {
        TableName: tableName,
        Key: marshall({
            "id": id,
            "userId": jwt['cognito:username']
        }),
        UpdateExpression: "set #v_name = :v_name, description = :v_description",
        ExpressionAttributeNames: { "#v_name": "name" },
        ExpressionAttributeValues: marshall({
            ":v_name": data.note.name,
            ":v_description": data.note.description
        })
    };

    let response = null;
    try {
        await client.send(new UpdateItemCommand(params));
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