import { S3Client, DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const s3Client = new S3Client({ region: 'ap-northeast-2' });
const ddbClient = new DynamoDBClient({ region: 'ap-northeast-2' });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const BUCKET_NAME = 'nationslab-courses';
const TABLE_NAME = 'nationslab-courses';

export const handler = async (event: any) => {
  try {
    const { courseId, path } = JSON.parse(event.body);

    // DynamoDB에서 강의 메타데이터 삭제
    await ddbDocClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id: courseId }
    }));

    // S3에서 강의 관련 파일들 삭제
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: path
    });

    const listedObjects = await s3Client.send(listCommand);
    
    if (listedObjects.Contents?.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Course deleted successfully'
        })
      };
    }

    const deleteParams = {
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: listedObjects.Contents?.map(({ Key }) => ({ Key })) || []
      }
    };

    await s3Client.send(new DeleteObjectsCommand(deleteParams));

    // 추가 객체가 있는지 확인
    if (listedObjects.IsTruncated) {
      const additionalObjects = await s3Client.send(listCommand);
      if (additionalObjects.Contents && additionalObjects.Contents.length > 0) {
        const additionalDeleteParams = {
          Bucket: BUCKET_NAME,
          Delete: {
            Objects: additionalObjects.Contents.map(({ Key }) => ({ Key }))
          }
        };
        await s3Client.send(new DeleteObjectsCommand(additionalDeleteParams));
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Course deleted successfully'
      })
    };
  } catch (error) {
    console.error('Error deleting course:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to delete course'
      })
    };
  }
}; 