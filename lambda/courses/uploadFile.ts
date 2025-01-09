import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: 'ap-northeast-2' });
const BUCKET_NAME = 'nationslab-courses';

interface UploadRequest {
  path: string;
  files: {
    name: string;
    type: string;
    size: number;
  }[];
}

export const handler = async (event: any) => {
  try {
    const { body } = event;
    const { path, files }: UploadRequest = JSON.parse(body);

    const presignedUrls = await Promise.all(
      files.map(async (file) => {
        const key = `${path}/${file.name}`;
        const putCommand = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          ContentType: file.type
        });

        const presignedUrl = await getSignedUrl(s3Client, putCommand, {
          expiresIn: 3600
        });

        return {
          name: file.name,
          type: file.type,
          size: file.size,
          presignedUrl,
          key
        };
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        presignedUrls
      })
    };
  } catch (error) {
    console.error('Error generating presigned URLs:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to generate presigned URLs'
      })
    };
  }
}; 