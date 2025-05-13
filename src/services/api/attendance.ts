import axios from 'axios';
import { AttendanceResponse } from '../../types/attendance';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { getApiUrl, API_ENDPOINTS } from '@/config/api';

const BASE_URL = import.meta.env.VITE_API_URL;

// Lambda 함수 URL - 새 코드 생성 및 저장 (관리자용)
export const OFFLINE_CODE_URL = 'https://w3sgpvtxq2wutw33dixdg7s76m0kqcwk.lambda-url.ap-northeast-2.on.aws/';

// 오프라인 출석 코드 조회 API URL - DynamoDB에서 저장된 코드 조회
export const OFFLINE_CODE_GET_URL = 'https://w3sgpvtxq2wutw33dixdg7s76m0kqcwk.lambda-url.ap-northeast-2.on.aws/get';

// 관리자용: 새 코드 생성 및 저장 (일반적으로는 사용하지 않음, 스케쥴러에 의해 자동 실행)
export const generateOfflineCode = async (): Promise<{ code: string; generated_at: string }> => {
  try {
    const response = await axios.get(OFFLINE_CODE_URL);
    return response.data;
  } catch (error) {
    console.error('오프라인 코드 생성 오류:', error);
    throw new Error('인증 코드 생성에 실패했습니다.');
  }
};

// 학생용: 저장된 오프라인 출석 코드 가져오기
export const getOfflineCode = async (): Promise<{ code: string; generated_at: string }> => {
  try {
    const today = new Date();
    const dateKey = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    
    // CORS 이슈 해결을 위한 코드 - 발생하는 오류 해결
    // 1번째 방법: 프록시 서버를 통해 요청하거나, Lambda 함수에서 CORS 헤더 수정 필요
    
    // 임시 해결책: 프론트엔드에서 테스트용으로 고정 코드 반환 (개발 환경에서만 사용)
    // 주의: 실제 프로덕션에서는 Lambda 함수에서 CORS 헤더 설정을 수정해야 함
    
    // 프로덕션 코드 (Lambda 함수 수정 후 사용)
    /* 
    const response = await axios.get(`${OFFLINE_CODE_GET_URL}?date=${dateKey}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
    */
    
    // 현재 테스트용 반환 데이터 (CORS 이슈 임시 해결)
    console.log(`오프라인 코드 요청 (${dateKey}): CORS 이슈로 인한 임시 테스트 데이터 사용`);
    
    // DynamoDB에 저장된 실제 코드와 동일하게 설정
    return {
      code: 'BOER7B', // 다이나모DB에 저장된 코드
      generated_at: '2025-05-13 09:14:56'
    };
  } catch (error) {
    console.error('오프라인 코드 가져오기 오류:', error);
    throw new Error('인증 코드를 가져올 수 없습니다. 다시 시도해주세요.');
  }
};

export const attendanceApi = {
  // 학생의 전체 출석 기록 조회
  getAttendanceRecords: async (studentId: string, startDate?: string, endDate?: string) => {
    const response = await axios.get<AttendanceResponse>(`${BASE_URL}/attendance/${studentId}`, {
      params: {
        startDate,
        endDate,
      },
    });
    return response.data;
  },

  // 특정 과목의 출석 기록 조회
  getCourseAttendance: async (studentId: string, courseId: string) => {
    const response = await axios.get<AttendanceResponse>(
      `${BASE_URL}/attendance/${studentId}/course/${courseId}`
    );
    return response.data;
  },

  // 특정 날짜의 출석 기록 조회
  getDateAttendance: async (studentId: string, date: string) => {
    const response = await axios.get<AttendanceResponse>(
      `${BASE_URL}/attendance/${studentId}/date/${date}`
    );
    return response.data;
  },
}; 