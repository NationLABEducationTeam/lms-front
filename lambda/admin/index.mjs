import { DynamoDBClient, QueryCommand, UpdateItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION
});

const TABLE_NAME = process.env.USER_TABLE_NAME;

async function getAllUsers() {
  try {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "role-index",
      KeyConditionExpression: "role = :role",
      ExpressionAttributeValues: marshall({
        ":role": "STUDENT"
      })
    });

    const response = await dynamoClient.send(command);
    const users = response.Items.map(item => unmarshall(item));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: true,
        data: users
      })
    };
  } catch (error) {
    console.error('Error getting users:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: false,
        error: "Failed to get users",
        message: error.message
      })
    };
  }
}

async function updateUserRole(userId, newRole) {
  try {
    const command = new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        id: userId
      }),
      UpdateExpression: "SET #role = :role",
      ExpressionAttributeNames: {
        "#role": "role"
      },
      ExpressionAttributeValues: marshall({
        ":role": newRole
      }),
      ReturnValues: "ALL_NEW"
    });

    const response = await dynamoClient.send(command);
    const updatedUser = unmarshall(response.Attributes);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: true,
        data: updatedUser
      })
    };
  } catch (error) {
    console.error('Error updating user role:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: false,
        error: "Failed to update user role",
        message: error.message
      })
    };
  }
}

async function deleteUser(userId) {
  try {
    const command = new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        id: userId
      }),
      ReturnValues: "ALL_OLD"
    });

    const response = await dynamoClient.send(command);
    const deletedUser = unmarshall(response.Attributes);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: true,
        data: deletedUser
      })
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: false,
        error: "Failed to delete user",
        message: error.message
      })
    };
  }
}

export const handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event));
  
  try {
    const httpMethod = event.requestContext?.http?.method;
    const path = event.rawPath?.toLowerCase();

    // 관리자 권한 체크
    const userRole = event.requestContext?.authorizer?.claims?.['custom:role'];
    if (userRole !== 'ADMIN') {
      return {
        statusCode: 403,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          success: false,
          error: "Unauthorized: Admin access required"
        })
      };
    }

    switch (true) {
      case httpMethod === 'GET' && path === '/admin/users':
        return await getAllUsers();

      case httpMethod === 'PUT' && path === '/admin/users/role':
        const { userId, role } = JSON.parse(event.body);
        return await updateUserRole(userId, role);

      case httpMethod === 'DELETE' && path === '/admin/users':
        const { userId: deleteUserId } = JSON.parse(event.body);
        return await deleteUser(deleteUserId);

      default:
        return {
          statusCode: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
          body: JSON.stringify({
            success: false,
            error: "Not Found",
            path: path
          })
        };
    }
  } catch (error) {
    console.error('Error in handler:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: false,
        error: "Internal server error",
        message: error.message
      })
    };
  }
}; 