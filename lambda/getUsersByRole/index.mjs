import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION
});

export const handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event));
  
  try {
    const role = event.queryStringParameters?.role;
    if (!role) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type,Authorization"
        },
        body: JSON.stringify({
          success: false,
          error: "Role parameter is required"
        })
      };
    }

    const command = new ScanCommand({
      TableName: "LMS_USER_POOL",
      FilterExpression: "#role = :roleValue",
      ExpressionAttributeNames: {
        "#role": "role"
      },
      ExpressionAttributeValues: marshall({
        ":roleValue": role
      })
    });

    const response = await dynamoClient.send(command);
    const users = (response.Items || []).map(item => unmarshall(item));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
      },
      body: JSON.stringify({
        success: true,
        data: users
      })
    };
  } catch (error) {
    console.error('Error fetching users by role:', error);
    
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
      },
      body: JSON.stringify({
        success: false,
        error: "Failed to fetch users",
        message: error.message
      })
    };
  }
}; 