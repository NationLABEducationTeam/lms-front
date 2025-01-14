import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({ region: 'ap-northeast-2' });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const TABLE_NAME = 'nationslab-courses';

export const handler = async (event: any) => {
  try {
    const { mainCategory, subCategory } = event.queryStringParameters || {};

    if (!mainCategory) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'mainCategory parameter is required'
        })
      };
    }

    let queryParams: any = {
      TableName: TABLE_NAME,
      IndexName: 'mainCategory-createdAt-index',
      KeyConditionExpression: 'mainCategory = :category',
      ExpressionAttributeValues: {
        ':category': mainCategory
      },
      ScanIndexForward: false // 최신순 정렬
    };

    // 소분류가 지정된 경우 필터 추가
    if (subCategory) {
      queryParams = {
        ...queryParams,
        FilterExpression: 'subCategory = :sub',
        ExpressionAttributeValues: {
          ...queryParams.ExpressionAttributeValues,
          ':sub': subCategory
        }
      };
    }

    const response = await ddbDocClient.send(new QueryCommand(queryParams));

    return {
      statusCode: 200,
      body: JSON.stringify({
        courses: response.Items || [],
        count: response.Count,
        scannedCount: response.ScannedCount
      })
    };
  } catch (error) {
    console.error('Error querying courses:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to query courses'
      })
    };
  }
}; 