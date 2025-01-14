import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const s3Client = new S3Client({ region: 'ap-northeast-2' });
const ddbClient = new DynamoDBClient({ region: 'ap-northeast-2' });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const BUCKET_NAME = 'nationslab-courses';
const TABLE_NAME = 'nationslab-courses';

interface CourseMetadata {
  id: string;
  title: string;
  description: string;
  mainCategory: string;
  subCategory: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
}

export const handler = async (event: any) => {
  try {
    const { body } = event;
    const courseData = JSON.parse(body);
    
    const courseId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const coursePath = `${courseData.mainCategory}/${courseData.subCategory}/courses/${courseId}`;
    
    // 메타데이터 저장
    const metadata: CourseMetadata = {
      id: courseId,
      title: courseData.title,
      description: courseData.description,
      mainCategory: courseData.mainCategory,
      subCategory: courseData.subCategory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      instructor: courseData.instructor
    };

    // DynamoDB에 메타데이터 저장
    await ddbDocClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: metadata
    }));

    // S3에 코스 폴더 생성
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${coursePath}/`,
      Body: ''
    }));

    // 메타데이터 파일 생성
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${coursePath}/meta.json`,
      Body: JSON.stringify(metadata),
      ContentType: 'application/json'
    }));

    // 주차별 폴더 생성
    for (let week = 1; week <= 16; week++) {
      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${coursePath}/${week}주차/`,
        Body: ''
      }));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        courseId,
        coursePath,
        message: 'Course created successfully'
      })
    };
  } catch (error) {
    console.error('Error creating course:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to create course'
      })
    };
  }
}; 