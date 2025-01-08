import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.BUCKET_NAME;
const QNA_PREFIX = 'qna/';

export const handler = async (event) => {
  try {
    const { httpMethod, path, body } = event;
    const pathSegments = path.split('/').filter(Boolean);
    const postId = pathSegments[1];

    switch (httpMethod) {
      case 'GET':
        if (postId) {
          return await getQnaPost(postId);
        }
        return await listQnaPosts();

      case 'POST':
        const postData = JSON.parse(body);
        return await createQnaPost(postData);

      case 'PUT':
        if (!postId) {
          throw new Error('Post ID is required');
        }
        const updateData = JSON.parse(body);
        return await updateQnaPost(postId, updateData);

      case 'DELETE':
        if (!postId) {
          throw new Error('Post ID is required');
        }
        return await deleteQnaPost(postId);

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ message: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message })
    };
  }
};

async function listQnaPosts() {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: QNA_PREFIX,
  });

  const { Contents = [] } = await s3Client.send(command);
  const posts = [];

  for (const item of Contents) {
    if (item.Key.endsWith('.json')) {
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: item.Key,
      });
      const response = await s3Client.send(getCommand);
      const post = JSON.parse(await streamToString(response.Body));
      posts.push(post);
    }
  }

  // 최신 글 순으로 정렬
  posts.sort((a, b) => new Date(b.metadata.createdAt) - new Date(a.metadata.createdAt));

  return {
    statusCode: 200,
    body: JSON.stringify(posts)
  };
}

async function getQnaPost(postId) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${QNA_PREFIX}${postId}.json`,
  });

  try {
    const response = await s3Client.send(command);
    const post = JSON.parse(await streamToString(response.Body));

    // 조회수 증가
    post.metadata.viewCount = (post.metadata.viewCount || 0) + 1;
    await updateQnaPost(postId, post);

    return {
      statusCode: 200,
      body: JSON.stringify(post)
    };
  } catch (error) {
    if (error.name === 'NoSuchKey') {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Post not found' })
      };
    }
    throw error;
  }
}

async function createQnaPost(data) {
  const postId = uuidv4();
  const now = new Date().toISOString();

  const post = {
    metadata: {
      id: postId,
      author: data.author,
      createdAt: now,
      updatedAt: now,
      viewCount: 0,
      commentCount: 0,
      isAnswered: false,
    },
    content: {
      title: data.title,
      body: data.content,
      summary: data.summary,
      attachments: [],
    },
  };

  // 첨부파일이 있는 경우 presigned URL 생성
  if (data.attachments && data.attachments.length > 0) {
    const attachmentUrls = await Promise.all(
      data.attachments.map(async (file) => {
        const attachmentId = uuidv4();
        const key = `${QNA_PREFIX}${postId}/attachments/${attachmentId}-${file.name}`;
        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          ContentType: file.type,
        });
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return {
          url: presignedUrl,
          key: key,
        };
      })
    );

    post.content.attachments = attachmentUrls.map(({ key }) => key);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        postId,
        attachmentUrls,
      })
    };
  }

  // 첨부파일이 없는 경우
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${QNA_PREFIX}${postId}.json`,
    Body: JSON.stringify(post),
    ContentType: 'application/json',
  });

  await s3Client.send(command);

  return {
    statusCode: 200,
    body: JSON.stringify({ postId })
  };
}

async function updateQnaPost(postId, data) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${QNA_PREFIX}${postId}.json`,
    Body: JSON.stringify({
      ...data,
      metadata: {
        ...data.metadata,
        updatedAt: new Date().toISOString(),
      },
    }),
    ContentType: 'application/json',
  });

  await s3Client.send(command);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Post updated successfully' })
  };
}

async function deleteQnaPost(postId) {
  // 게시글 JSON 파일 삭제
  const deleteCommand = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${QNA_PREFIX}${postId}.json`,
  });

  await s3Client.send(deleteCommand);

  // 첨부파일이 있는 경우 함께 삭제
  const listCommand = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: `${QNA_PREFIX}${postId}/attachments/`,
  });

  const { Contents = [] } = await s3Client.send(listCommand);
  
  if (Contents.length > 0) {
    await Promise.all(
      Contents.map((item) =>
        s3Client.send(
          new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: item.Key,
          })
        )
      )
    );
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Post deleted successfully' })
  };
}

function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    stream.on('error', reject);
  });
} 