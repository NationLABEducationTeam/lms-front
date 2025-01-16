export const handler = async (event) => {
  try {
    console.log('Headers:', event.headers);
    console.log('Content-Type:', event.headers['content-type']);
    
    // 권한 체크 (기존과 동일)
  } catch (error) {
    console.error('Error in handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An error occurred' }),
    };
  }
}; 