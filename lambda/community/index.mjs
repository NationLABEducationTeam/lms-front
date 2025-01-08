import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2'
});

const BUCKET_NAME = 'nationslablmscommunity';

// 자유게시판 글 생성
async function createPost(event) {
  try {
    const { title, content, summary, author, attachments = [] } = JSON.parse(event.body);
    const postId = uuidv4();
    const timestamp = new Date().toISOString();

    // 게시글 메타데이터
    const postMetadata = {
      metadata: {
        id: postId,
        author,
        createdAt: timestamp,
        updatedAt: timestamp,
        viewCount: 0,
        commentCount: 0,
      },
      content: {
        title,
        body: content,
        summary,
      },
      attachments: []
    };

    // 첨부파일이 있는 경우 presigned URL 생성
    const attachmentUrls = await Promise.all(
      attachments.map(async (file) => {
        const fileId = uuidv4();
        const fileKey = `posts/${postId}/attachments/${fileId}-${file.name}`;
        
        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: fileKey,
          ContentType: file.type
        });
        
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        
        postMetadata.attachments.push({
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          url: `https://${BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com/${fileKey}`,
          uploadedAt: timestamp
        });

        return {
          presignedUrl,
          key: fileKey
        };
      })
    );

    // 게시글 메타데이터 저장
    const metadataCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `posts/${postId}/metadata.json`,
      Body: JSON.stringify(postMetadata),
      ContentType: 'application/json'
    });
    await s3Client.send(metadataCommand);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        postId,
        attachmentUrls
      })
    };
  } catch (error) {
    console.error('Error creating post:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        error: "Failed to create post",
        message: error.message
      })
    };
  }
}

// 게시글 목록 조회
async function getPosts() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: 'posts/',
      Delimiter: '/'
    });

    const response = await s3Client.send(command);
    const postFolders = response.CommonPrefixes || [];

    const posts = await Promise.all(
      postFolders.map(async (folder) => {
        try {
          const metadataCommand = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `${folder.Prefix}metadata.json`
          });
          
          const metadataResponse = await s3Client.send(metadataCommand);
          const metadata = JSON.parse(await metadataResponse.Body.transformToString());
          
          return metadata;
        } catch (error) {
          console.error(`Error reading metadata for ${folder.Prefix}:`, error);
          return null;
        }
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(posts.filter(Boolean))
    };
  } catch (error) {
    console.error('Error getting posts:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        error: "Failed to get posts",
        message: error.message
      })
    };
  }
}

// 특정 게시글 조회
async function getPost(postId) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `posts/${postId}/metadata.json`
    });

    const response = await s3Client.send(command);
    const post = JSON.parse(await response.Body.transformToString());

    // 조회수 증가
    post.metadata.viewCount += 1;

    // 업데이트된 메타데이터 저장
    const updateCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `posts/${postId}/metadata.json`,
      Body: JSON.stringify(post),
      ContentType: 'application/json'
    });
    await s3Client.send(updateCommand);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(post)
    };
  } catch (error) {
    console.error('Error getting post:', error);
    return {
      statusCode: error.name === 'NoSuchKey' ? 404 : 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        error: error.name === 'NoSuchKey' ? "Post not found" : "Failed to get post",
        message: error.message
      })
    };
  }
}

export const handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event));
  
  const httpMethod = event.requestContext?.http?.method;
  const path = event.rawPath;

  try {
    switch (true) {
      case httpMethod === 'POST' && path === '/community/posts':
        return await createPost(event);
      
      case httpMethod === 'GET' && path === '/community/posts':
        return await getPosts();
      
      case httpMethod === 'GET' && path.match(/^\/community\/posts\/[\w-]+$/):
        const postId = path.split('/').pop();
        return await getPost(postId);
      
      default:
        return {
          statusCode: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
          body: JSON.stringify({
            error: "Not Found",
            path
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
        error: "Internal server error",
        message: error.message
      })
    };
  }
}; 