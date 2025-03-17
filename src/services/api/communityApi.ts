import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

// 커뮤니티 API 생성 (기본 구조만 포함)
export const communityApi = createApi({
  reducerPath: 'communityApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Community'],
  endpoints: (builder) => ({
    // 엔드포인트는 필요할 때 추가
  }),
}); 