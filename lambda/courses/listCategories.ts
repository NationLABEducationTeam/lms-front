import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: "ap-northeast-2" });
const ddbClient = new DynamoDBClient({ region: "ap-northeast-2" });
const docClient = DynamoDBDocumentClient.from(ddbClient);
const BUCKET_NAME = "nationslablmscoursebucket";
const TABLE_NAME = "nationslab-courses";

export const handler = async (event) => {
  try {
    const path = event.queryStringParameters?.path;
    
    // path가 있으면 특정 경로의 S3 컨텐츠만 반환
    if (path) {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: path,
        Delimiter: '/'
      });

      const response = await s3Client.send(command);
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          folders: response.CommonPrefixes?.map(prefix => ({
            name: prefix.Prefix?.split('/').slice(-2)[0],
            path: prefix.Prefix?.slice(0, -1),
            type: 'directory'
          })) || [],
          files: response.Contents?.filter(item => !item.Key?.endsWith('/'))
            .map(item => ({
              name: item.Key?.split('/').pop(),
              path: item.Key,
              type: 'file',
              size: item.Size,
              lastModified: item.LastModified
            })) || []
        })
      };
    }
    
    // path가 없으면 전체 강의 목록과 카테고리 구조를 한 번에 반환
    const { Items } = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME
    }));

    // 강의 목록을 카테고리별로 그룹화
    const categories = Items.reduce((acc, course) => {
      const mainCat = course.mainCategory;
      const subCat = course.subCategory;
      
      if (!acc[mainCat]) {
        acc[mainCat] = {
          name: mainCat,
          path: mainCat,
          type: 'directory',
          subCategories: {}
        };
      }
      
      if (!acc[mainCat].subCategories[subCat]) {
        acc[mainCat].subCategories[subCat] = {
          name: subCat,
          path: `${mainCat}/${subCat}`,
          type: 'directory',
          courses: []
        };
      }
      
      acc[mainCat].subCategories[subCat].courses.push(course);
      return acc;
    }, {});

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        courses: Items,
        categories: Object.values(categories),
        success: true
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Failed to list categories and courses',
        error: error.message
      })
    };
  }
}; 