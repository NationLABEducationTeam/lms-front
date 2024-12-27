import { DynamoDBClient, ScanCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export interface DBUser {
  user_id: string;
  email: string;
  name: string;
  given_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

const dynamoClient = new DynamoDBClient({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

export const getAllUsers = async (): Promise<DBUser[]> => {
  try {
    const command = new ScanCommand({
      TableName: "LMS_USER_POOL",
    });

    const response = await dynamoClient.send(command);
    return (response.Items || []).map(item => unmarshall(item) as DBUser);
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

export const getStudents = async (): Promise<DBUser[]> => {
  try {
    // DynamoDB에서 role이 'STUDENT'인 사용자만 가져오기
    const command = new ScanCommand({
      TableName: "LMS_USER_POOL",
      FilterExpression: "#role = :roleValue",
      ExpressionAttributeNames: {
        "#role": "role"
      },
      ExpressionAttributeValues: marshall({
        ":roleValue": "STUDENT"
      })
    });

    const response = await dynamoClient.send(command);
    return (response.Items || []).map(item => unmarshall(item) as DBUser);
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
}; 