import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const s3Client = new S3Client({ region: 'ap-northeast-2' });
const ddbClient = new DynamoDBClient({ region: 'ap-northeast-2' });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const BUCKET_NAME = 'nationslab-courses';
const TABLE_NAME = 'nationslab-courses';

export const handler = async (event: any) => {
  try {
    const { courseId, ...updateData } = JSON.parse(event.body);

    // DynamoDB 업데이트 표현식 생성
    const updateExpression = 'SET ' + Object.keys(updateData)
      .map(key => `#${key} = :${key}`)
      .join(', ') + ', #updatedAt = :updatedAt';

    const expressionAttributeNames = Object.keys(updateData).reduce((acc, key) => {
      acc[`#${key}`] = key;
      return acc;
    }, { '#updatedAt': 'updatedAt' });

    const expressionAttributeValues = Object.entries(updateData).reduce((acc, [key, value]) => {
      acc[`:${key}`] = value;
      return acc;
    }, { ':updatedAt': new Date().toISOString() });

    // DynamoDB 메타데이터 업데이트
    await ddbDocClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id: courseId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }));

    // S3 메타데이터 파일 업데이트
    const metaPath = `${updateData.mainCategory}/${updateData.subCategory}/courses/${courseId}/meta.json`;
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: metaPath,
      Body: JSON.stringify({
        id: courseId,
        ...updateData,
        updatedAt: new Date().toISOString()
      }),
      ContentType: 'application/json'
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Course updated successfully',
        courseId
      })
    };
  } catch (error) {
    console.error('Error updating course:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to update course'
      })
    };
  }
}; 