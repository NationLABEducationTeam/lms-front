import { S3Client, DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION
});

const BUCKET_NAME = process.env.BUCKET_NAME;

async function deleteCourse(coursePath) {
  try {
    // 해당 경로의 모든 객체 조회
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: coursePath
    });

    const response = await s3Client.send(listCommand);
    if (!response.Contents?.length) {
      throw new Error('Course not found');
    }

    // 모든 객체 삭제
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: response.Contents.map(obj => ({ Key: obj.Key }))
      }
    });

    await s3Client.send(deleteCommand);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: true,
        message: "Course deleted successfully"
      })
    };
  } catch (error) {
    console.error('Error deleting course:', error);
    return {
      statusCode: error.message === 'Course not found' ? 404 : 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: false,
        error: error.message === 'Course not found' ? 'Course not found' : 'Failed to delete course',
        message: error.message
      })
    };
  }
}

async function updateCourseMetadata(coursePath, metadata) {
  try {
    const metadataPath = `${coursePath}/meta.json`;
    
    // 메타데이터 업데이트
    await s3Client.putObject({
      Bucket: BUCKET_NAME,
      Key: metadataPath,
      Body: JSON.stringify({
        ...metadata,
        lastModified: new Date().toISOString()
      }),
      ContentType: 'application/json'
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: true,
        message: "Course metadata updated successfully"
      })
    };
  } catch (error) {
    console.error('Error updating course metadata:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: false,
        error: "Failed to update course metadata",
        message: error.message
      })
    };
  }
}

async function moveCourse(oldPath, newPath) {
  try {
    // 기존 강의 내용 조회
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: oldPath
    });

    const response = await s3Client.send(listCommand);
    if (!response.Contents?.length) {
      throw new Error('Course not found');
    }

    // 모든 객체를 새 경로로 복사
    for (const obj of response.Contents) {
      const newKey = obj.Key.replace(oldPath, newPath);
      await s3Client.copyObject({
        Bucket: BUCKET_NAME,
        CopySource: `${BUCKET_NAME}/${obj.Key}`,
        Key: newKey
      });
    }

    // 기존 객체들 삭제
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: response.Contents.map(obj => ({ Key: obj.Key }))
      }
    });

    await s3Client.send(deleteCommand);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: true,
        message: "Course moved successfully"
      })
    };
  } catch (error) {
    console.error('Error moving course:', error);
    return {
      statusCode: error.message === 'Course not found' ? 404 : 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: false,
        error: error.message === 'Course not found' ? 'Course not found' : 'Failed to move course',
        message: error.message
      })
    };
  }
}

export const handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event));
  
  try {
    const httpMethod = event.requestContext?.http?.method;
    const path = event.rawPath?.toLowerCase();

    // 관리자 권한 체크
    const userRole = event.requestContext?.authorizer?.claims?.['custom:role'];
    if (userRole !== 'ADMIN') {
      return {
        statusCode: 403,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          success: false,
          error: "Unauthorized: Admin access required"
        })
      };
    }

    switch (true) {
      case httpMethod === 'DELETE' && path === '/admin/courses':
        const { coursePath } = JSON.parse(event.body);
        return await deleteCourse(coursePath);

      case httpMethod === 'PUT' && path === '/admin/courses/metadata':
        const { coursePath: metadataPath, metadata } = JSON.parse(event.body);
        return await updateCourseMetadata(metadataPath, metadata);

      case httpMethod === 'PUT' && path === '/admin/courses/move':
        const { oldPath, newPath } = JSON.parse(event.body);
        return await moveCourse(oldPath, newPath);

      default:
        return {
          statusCode: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
          body: JSON.stringify({
            success: false,
            error: "Not Found",
            path: path
          })
        };
    }
  } catch (error) {
    console.error('Error in handler:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: false,
        error: "Internal server error",
        message: error.message
      })
    };
  }
}; 