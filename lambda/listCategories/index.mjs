import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION
});

export const handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event));
  
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.BUCKET_NAME,
      Delimiter: '/'
    });

    const response = await s3Client.send(command);
    const folders = response.CommonPrefixes?.map(prefix => {
      const name = prefix.Prefix.replace('/', '');
      return {
        name,
        path: prefix.Prefix
      };
    }) || [];

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
        data: folders
      })
    };
  } catch (error) {
    console.error('Error listing categories:', error);
    
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
        error: "Failed to list categories",
        message: error.message
      })
    };
  }
}; 