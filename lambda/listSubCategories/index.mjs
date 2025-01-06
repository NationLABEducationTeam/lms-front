import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION
});

export const handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event));
  
  try {
    const mainCategory = event.pathParameters?.category;
    if (!mainCategory) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type,Authorization"
        },
        body: JSON.stringify({
          success: false,
          error: "Main category parameter is required"
        })
      };
    }

    const command = new ListObjectsV2Command({
      Bucket: process.env.BUCKET_NAME,
      Prefix: mainCategory,
      Delimiter: '/'
    });

    const response = await s3Client.send(command);
    const folders = response.CommonPrefixes?.map(prefix => {
      const fullPath = prefix.Prefix;
      const name = fullPath.split('/').filter(Boolean).pop() || '';
      return {
        name,
        path: fullPath
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
    console.error('Error listing subcategories:', error);
    
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
        error: "Failed to list subcategories",
        message: error.message
      })
    };
  }
}; 