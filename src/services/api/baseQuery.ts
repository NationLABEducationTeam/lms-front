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
      }
      return headers;
    } catch (error) {
      console.error('Error preparing headers:', error);
      return headers;
    }
  },
  timeout: 10000, // 10초 타임아웃
}); 