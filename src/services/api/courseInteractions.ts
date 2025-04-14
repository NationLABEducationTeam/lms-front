import axios from 'axios';

// 람다 함수 URL
const LAMBDA_URL = 'https://i5x3mjgxwnyileqfujf64qusiq0onpvq.lambda-url.ap-northeast-2.on.aws';

// 타입 정의
export interface CourseData {
  id: string;
  title: string;
  image?: string;
  description?: string;
  instructor_name?: string;
  price?: number;
  category_id?: string;
}

interface CourseItem {
  courseId: string;
  courseData: CourseData;
  addedAt: string;
  quantity: number;
}

interface ApiResponse<T> {
  success: boolean;
  items?: T[];
  exists?: boolean;
  message?: string;
}

// API 요청 함수 - 디버깅용 래퍼
const apiCall = async (method: string, endpoint: string, data?: any) => {
  try {
    console.log(`API 호출: ${method} ${LAMBDA_URL}${endpoint}`, data);
    const url = `${LAMBDA_URL}${endpoint}`;
    
    let response;
    if (method === 'GET') {
      // GET 요청은 params로 데이터 전달
      response = await axios.get(url, { params: data });
    } else if (method === 'POST') {
      // POST 요청은 body로 데이터 전달
      response = await axios.post(url, data);
    } else if (method === 'DELETE') {
      // DELETE 요청은 data 속성으로 데이터 전달
      response = await axios.delete(url, { data });
    } else if (method === 'PUT') {
      // PUT 요청은 body로 데이터 전달
      response = await axios.put(url, data);
    }
    
    console.log(`API 응답: ${url}`, response?.data);
    return response?.data;
  } catch (error) {
    console.error(`API 오류 (${method} ${endpoint}):`, error);
    if (axios.isAxiosError(error)) {
      console.error('상세 오류:', error.response?.data || error.message);
    }
    return { success: false, message: error instanceof Error ? error.message : '알 수 없는 오류' };
  }
};

// 장바구니에 추가
export const addToCart = async (
  userId: string,
  course: any
): Promise<{ success: boolean }> => {
  // 최소한의 필수 필드만 포함 (DynamoDB 크기 제한 고려)
  const courseData: CourseData = {
    id: course.id,
    title: course.title || '',
    // 필수 필드만 포함
    price: typeof course.price === 'string' ? parseInt(course.price, 10) : (course.price || 0)
  };
  
  return apiCall('POST', '/addToCart', { userId, courseData });
};

// 위시리스트에 추가
export const addToWishlist = async (
  userId: string,
  course: any
): Promise<{ success: boolean }> => {
  // 최소한의 필수 필드만 포함 (DynamoDB 크기 제한 고려)
  const courseData: CourseData = {
    id: course.id,
    title: course.title || '',
    // 필수 필드만 포함
    price: typeof course.price === 'string' ? parseInt(course.price, 10) : (course.price || 0)
  };
  
  return apiCall('POST', '/addToWishlist', { userId, courseData });
};

// 장바구니에서 제거
export const removeFromCart = async (
  userId: string,
  courseId: string
): Promise<{ success: boolean }> => {
  return apiCall('DELETE', '/removeFromCart', { userId, courseId });
};

// 위시리스트에서 제거
export const removeFromWishlist = async (
  userId: string,
  courseId: string
): Promise<{ success: boolean }> => {
  return apiCall('DELETE', '/removeFromWishlist', { userId, courseId });
};

// 장바구니 또는 위시리스트 목록 가져오기
export const getList = async (
  userId: string,
  type: 'CART' | 'WISHLIST'
): Promise<{
  success: boolean;
  data: CourseItem[];
  error?: unknown;
}> => {
  const endpoint = type === 'CART' ? '/getCart' : '/getWishlist';
  const response = await apiCall('GET', endpoint, { userId });
  
  if (!response.success) {
    return { success: false, data: [] };
  }
  
  // 필요한 필드만 추출하여 반환 (데이터 크기 감소)
  const cleanedItems = response.items?.map((item: any) => ({
    courseId: item.courseId,
    courseData: {
      id: item.courseData?.id,
      title: item.courseData?.title || '',
      price: item.courseData?.price || 0
    },
    addedAt: item.addedAt,
    quantity: item.quantity || 1
  })) || [];
  
  return { 
    success: true, 
    data: cleanedItems
  };
};

// 위시리스트 항목 목록 가져오기
export const getWishlist = async (userId: string): Promise<CourseData[]> => {
  const response = await apiCall('GET', '/getWishlist', { userId });
  
  if (!response.success || !response.items) {
    return [];
  }
  
  // 필요한 필드만 추출하여 반환 (데이터 크기 감소)
  return response.items.map((item: any) => ({
    id: item.courseData?.id,
    title: item.courseData?.title || '',
    price: item.courseData?.price || 0
  }));
};

// 장바구니 수량 업데이트
export const updateCartQuantity = async (
  userId: string,
  courseId: string,
  quantity: number
): Promise<{ success: boolean }> => {
  return apiCall('PUT', '/updateCartQuantity', { userId, courseId, quantity });
};

// 위시리스트 항목을 장바구니로 이동
export const moveToCart = async (
  userId: string,
  courseId: string
): Promise<{ success: boolean }> => {
  return apiCall('POST', '/moveToCart', { userId, courseId });
};

// 장바구니에 있는지 확인
export const isInCart = async (
  userId: string,
  courseId: string
): Promise<{ success: boolean; exists: boolean }> => {
  const response = await apiCall('GET', '/isInCart', { userId, courseId });
  
  return { 
    success: response.success, 
    exists: response.exists || false 
  };
};

// 위시리스트에 있는지 확인
export const isInWishlist = async (
  userId: string,
  courseId: string
): Promise<{ success: boolean; exists: boolean; item?: any }> => {
  const response = await apiCall('GET', '/isInWishlist', { userId, courseId });
  
  return { 
    success: response.success, 
    exists: response.exists || false 
  };
};

// 장바구니 비우기
export const clearCart = async (
  userId: string
): Promise<{ success: boolean }> => {
  return apiCall('DELETE', '/clearCart', { userId });
}; 