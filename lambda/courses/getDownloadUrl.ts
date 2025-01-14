import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: 'ap-northeast-2' });
const BUCKET_NAME = 'nationslab-courses';

export const handler = async (event: any) => {
  try {
    const { path } = event.queryStringParameters || {};
    
    if (!path) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Path parameter is required'
        })
      };
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: path
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        presignedUrl
      })
    };
  } catch (error) {
    console.error('Error generating download URL:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to generate download URL'
      })
    };
  }
}; 