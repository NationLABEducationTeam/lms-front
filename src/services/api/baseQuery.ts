import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import { fetchAuthSession } from '@aws-amplify/auth';
import { getApiUrl } from '@/config/api';

export const baseQueryWithReauth = fetchBaseQuery({
  baseUrl: getApiUrl(''),
  prepareHeaders: async (headers, { endpoint }) => {
    // 인증이 필요 없는 공개 엔드포인트 목록
    const publicEndpoints = ['getPublicReviewTemplate', 'submitReviewResponse'];

    // 현재 요청이 공개 엔드포인트가 아닐 경우에만 인증 헤더 추가
    if (!publicEndpoints.includes(endpoint)) {
      try {
        const { tokens } = await fetchAuthSession();
        const idToken = tokens?.idToken?.toString();
        if (idToken) {
          headers.set('Authorization', `Bearer ${idToken}`);
          console.log(`[${endpoint}] Authorization 헤더 설정됨`);
        } else {
          console.warn(`[${endpoint}] 인증 토큰이 없습니다`);
        }
      } catch (error) {
        console.error(`[${endpoint}] 헤더 준비 중 오류 발생:`, error);
      }
    } else {
        console.log(`[${endpoint}] 공개 API 호출, 인증 헤더를 추가하지 않습니다.`);
    }
    
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    
    console.log(`[${endpoint}] 요청 헤더:`, Object.fromEntries(headers.entries()));
    return headers;
  },
  timeout: 15000, // 15초 타임아웃으로 연장
}); 