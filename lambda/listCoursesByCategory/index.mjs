import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION
});

export const handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event));
  
  try {
    const { mainCategory, subCategory } = event.pathParameters || {};
    if (!mainCategory || !subCategory) {
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
          error: "Main category and subcategory parameters are required"
        })
      };
    }

    const prefix = `${mainCategory}/${subCategory}/`;
    const command = new ListObjectsV2Command({
      Bucket: process.env.BUCKET_NAME,
      Prefix: prefix,
      Delimiter: '/'
    });

    const response = await s3Client.send(command);
    const courseFolders = response.CommonPrefixes || [];
    
    // 각 강의 폴더에서 metadata.json 파일 읽기
    const coursePromises = courseFolders.map(async (folder) => {
      try {
        const metadataCommand = new GetObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: `${folder.Prefix}metadata.json`
        });
        
        const metadataResponse = await s3Client.send(metadataCommand);
        const metadata = JSON.parse(await metadataResponse.Body.transformToString());
        
        return {
          ...metadata,
          path: folder.Prefix
        };
      } catch (error) {
        console.error(`Error reading metadata for ${folder.Prefix}:`, error);
        return null;
      }
    });

    const courses = (await Promise.all(coursePromises)).filter(Boolean);

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
        data: courses
      })
    };
  } catch (error) {
    console.error('Error listing courses:', error);
    
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
        error: "Failed to list courses",
        message: error.message
      })
    };
  }
}; 