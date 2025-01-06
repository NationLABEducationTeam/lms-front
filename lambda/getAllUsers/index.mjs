import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const dynamoClient = new DynamoDBClient({
  region: "ap-northeast-2"
});

export const handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event));
  
  try {
    // 관리자 권한 체크
    const userRole = event.requestContext?.authorizer?.claims?.['custom:role'];
    if (userRole !== 'ADMIN') {
      return {
        statusCode: 403,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type,Authorization"
        },
        body: JSON.stringify({
          success: false,
          error: "Unauthorized: Admin access required"
        })
      };
    }

    const command = new ScanCommand({
      TableName: "LMS_USER_POOL",
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
    console.error('Error fetching users:', error);
    
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
