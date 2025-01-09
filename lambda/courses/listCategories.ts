import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'ap-northeast-2' });
const BUCKET_NAME = 'nationslab-lms';

export const handler = async (event) => {
  try {
    const path = event.queryStringParameters?.path || '';

    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: path,
      Delimiter: '/'
    });

    const response = await s3Client.send(command);
    
    // 폴더와 파일 분리
    const folders = response.CommonPrefixes?.map(prefix => ({
      name: prefix.Prefix?.split('/').slice(-2)[0],
      path: prefix.Prefix?.slice(0, -1),
      type: 'folder'
    })) || [];

    const files = response.Contents?.filter(item => !item.Key?.endsWith('/'))
      .map(item => ({
        name: item.Key?.split('/').pop(),
        path: item.Key,
        type: 'file',
        size: item.Size,
        lastModified: item.LastModified
      })) || [];

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        folders,
        files
      })
    };
  } catch (error) {
    console.error('Error listing categories:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Failed to list categories'
      })
    };
  }
}; 