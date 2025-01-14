import axios from 'axios';
import { AttendanceResponse } from '../../types/attendance';

const BASE_URL = import.meta.env.VITE_API_URL;

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