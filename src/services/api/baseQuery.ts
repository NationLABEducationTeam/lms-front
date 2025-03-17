import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import { fetchAuthSession } from '@aws-amplify/auth';
import { getApiUrl } from '@/config/api';

export const baseQueryWithReauth = fetchBaseQuery({
  baseUrl: getApiUrl(''),
  prepareHeaders: async (headers) => {
    try {
      const { tokens } = await fetchAuthSession();
      const idToken = tokens?.idToken?.toString();
      if (idToken) {
        headers.set('Authorization', `Bearer ${idToken}`);
        console.log('Authorization 헤더 설정됨');
      } else {
        console.warn('인증 토큰이 없습니다');
      }
      
      // CORS 문제 해결을 위한 추가 헤더
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      
      console.log('요청 헤더:', Object.fromEntries(headers.entries()));
      return headers;
    } catch (error) {
      console.error('헤더 준비 중 오류 발생:', error);
      return headers;
    }
  },
  timeout: 15000, // 15초 타임아웃으로 연장
}); 