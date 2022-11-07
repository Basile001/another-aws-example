// Import dynamodb from aws-sdk
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

// Import all functions from get-all-items.js
import { getAllNoteHandler } from "../../../src/handlers/note/getAll-note"
import { expect, describe, beforeEach, it } from '@jest/globals';
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";


// This includes all tests for getAllItemsHandler
describe('Test getAllItemsHandler', () => {

    const ddbMock = mockClient(DynamoDBClient);

    beforeEach(() => {
        ddbMock.reset();
    });

    // This test invokes getAllItemsHandler and compares the result
    it('should return ids', async () => {
        const items = [marshall({ id: 'id1', userId: 'Basile001', name: 'name', description: "desc" }), marshall({ id: 'id2', userId: 'Basile001', name: 'name2', description: "desc2" })];

        ddbMock.on(QueryCommand).resolves({ Items: items });

        const event = {
            httpMethod: 'GET',
            headers: {
                Authorization: "eyJraWQiOiI5c1JJTWdBVnRzdjNzZzRcL1VKdHhZRGNHYzJHNkJZeE9MaXNmenhXa1hZcz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjOWFjNTAxYy1kOTZmLTRhNGMtOGM3OS1mNjU0MWRmM2U2ZTciLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYmlydGhkYXRlIjoiMThcLzEyXC8xOTkwIiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMy5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTNfOEVZMUF6YWFUIiwiY29nbml0bzp1c2VybmFtZSI6IkJhc2lsZTAwMSIsIm9yaWdpbl9qdGkiOiIwZmIyZjNkMi0zZDMxLTQwMzUtYjA1Yy1lOGM0MGYzOGVkZTEiLCJhdWQiOiIxZTE2b24yMnFqb29uYnU3Yms4YnFmdTg5ayIsImV2ZW50X2lkIjoiZjA5YWM1YmItYjZlZi00NjZkLTg3MmYtMzJhN2E3NDkwNDYzIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2Njc1Njk3NzcsIm5hbWUiOiJCYXNpbGUiLCJleHAiOjE2Njc1NzMzNzcsImlhdCI6MTY2NzU2OTc3NywiZmFtaWx5X25hbWUiOiJHUkFORFBFUlJFVCIsImp0aSI6IjEyZjc4MjRlLTEzOGYtNGI0Yy1hOWY2LTE2ZTQzMTdmZWRkYiIsImVtYWlsIjoiYmFzaWxlLmdyYW5kcGVycmV0QGhvdG1haWwuZnIifQ.j4ZNO0euP60neuPiOuAJ59xTOZt7i42kALrAY-eL40dtfFzFWsOlfTIJE8bIaWaQyHUHcGOFblqq0hZMeBFWLRlT8Y1ZggwOaefi6w9X5aNPDowqzDxlpS6mDieaxoFna6gXc6-Oku4GubtaByBgU6obi-AZQ6B495TSMJQA0WuKfPC6vYagqNUd5dRt8oe3N7wFh9EEm5BDOLCZyaVgMyRRwBcJ6NqxYfipjOloRxFdpGBVG0Z27ftKVfSCURa4I8mG-y4pVopkWJ2rDtDJIX5525tJmbzlDRmcC18KZA8a9UJoZMI1vbjs2BPCUOUMgVUbDZ1Cs1TDV3SvFrdRoQ"
            }
        };

        // Invoke getAllItemsHandler
        const result = await getAllNoteHandler(event);

        const expectedResult = {
            statusCode: 200,
            body: JSON.stringify(items.map((res) => unmarshall(res))),
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS 
            }
        };

        // Compare the result with the expected result
        expect(result).toEqual(expectedResult);
    });
});
