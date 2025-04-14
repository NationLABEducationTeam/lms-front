import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { getApiUrl } from '@/config/api';

// 백엔드 응답 인터페이스
interface ZoomMeeting {
  uuid: string;
  id: number;
  host_id: string;
  topic: string;
  type: number;
  start_time: string;
  duration: number;
  timezone: string;
  created_at: string;
  join_url: string;
  supportGoLive: boolean;
}

// 라이브 미팅은 구조가 다름
interface ZoomLiveMeeting {
  id: number;
  topic: string;
  host_id: string;
  start_time: string;
  duration: number;
  course_title: string | null;
  enrolled_students_count: number;
  current_attendance_rate: string;
  active_participants_count: number;
  total_participants_count: number;
  meeting_duration_minutes: number;
  meeting_duration_formatted: string;
  active_participants: Array<{
    name: string;
    email: string;
    duration_minutes: number;
    duration_formatted: string;
    first_join_time: string;
    is_active: boolean;
    session_count: number;
  }>;
  recent_past_participants: Array<{
    name: string;
    email: string;
    duration_minutes: number;
    duration_formatted: string;
    first_join_time: string;
    last_leave_time: string;
    is_active: boolean;
    session_count: number;
  }>;
}

interface ZoomUpcomingMeeting {
  id: number;
  topic: string;
  start_time: string;
  duration: number;
  join_url: string;
}

interface ZoomRecentPastMeeting {
  id: number;
  topic: string;
  start_time: string;
  duration: number;
  course_title: string | null;
}

interface ZoomAccountInfo {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  plan_type: number;
}

interface ZoomMeetingsGroup {
  count: number;
  meetings: ZoomMeeting[];
}

interface ZoomLiveMeetingsGroup {
  count: number;
  meetings: ZoomLiveMeeting[];
}

interface ZoomUpcomingMeetingsGroup {
  count: number;
  meetings: ZoomUpcomingMeeting[];
}

interface ZoomRecentPastMeetingsGroup {
  count: number;
  meetings: ZoomRecentPastMeeting[];
}

interface ZoomDashboardSummaryResponse {
  success: boolean;
  message: string;
  data: {
    live_meetings: ZoomLiveMeetingsGroup;
    upcoming_meetings: ZoomUpcomingMeetingsGroup;
    recent_past_meetings: ZoomRecentPastMeetingsGroup;
    timestamp: string;
  };
}

// API 응답 구조에 맞게 인터페이스 정의
export interface ZoomDashboardSummary {
  success: boolean;
  message: string;
  data: {
    live_meetings: {
      count: number;
      meetings: Array<{
        id: string | number;
        topic: string;
        host_id: string;
        start_time: string;
        duration: number;
        course_title: string | null;
        enrolled_students_count: number;
        current_attendance_rate: string;
        active_participants_count: number;
        total_participants_count: number;
        meeting_duration_minutes: number;
        meeting_duration_formatted: string;
        meeting_info?: {
          start_time: string;
          duration_formatted: string;
          duration_seconds: number;
          duration_minutes: number;
        };
        active_participants: Array<{
          name: string;
          email: string;
          duration_minutes: number;
          duration_formatted: string;
          first_join_time: string;
          is_active: boolean;
          session_count: number;
          attendance_rate: number;
          timeline_data: Array<{
            type: 'gap' | 'session';
            position_start: number;
            position_end: number;
            position_width: number;
            session_index?: number;
            join_time?: string;
            leave_time?: string | null;
            duration_seconds?: number;
            duration_formatted?: string;
            is_active?: boolean;
          }>;
          sessions: Array<{
            join_time: string;
            leave_time: string | null;
            duration_formatted: string;
            position_start: number;
            position_end: number;
            position_width: number;
            is_active: boolean;
          }>;
        }>;
        recent_past_participants: Array<{
          name: string;
          email: string;
          duration_minutes: number;
          duration_formatted: string;
          first_join_time: string;
          last_leave_time: string;
          is_active: boolean;
          session_count: number;
          attendance_rate: number;
          timeline_data: Array<{
            type: 'gap' | 'session';
            position_start: number;
            position_end: number;
            position_width: number;
            session_index?: number;
            join_time?: string;
            leave_time?: string | null;
            duration_seconds?: number;
            duration_formatted?: string;
            is_active?: boolean;
          }>;
          sessions: Array<{
            join_time: string;
            leave_time: string;
            duration_formatted: string;
            position_start: number;
            position_end: number;
            position_width: number;
            is_active: boolean;
          }>;
        }>;
        all_participants?: Array<{
          name: string;
          email: string;
          duration_minutes: number;
          duration_formatted: string;
          first_join_time: string;
          last_leave_time?: string;
          is_active: boolean;
          session_count: number;
          attendance_rate: number;
          timeline_data: Array<{
            type: 'gap' | 'session';
            position_start: number;
            position_end: number;
            position_width: number;
            session_index?: number;
            join_time?: string;
            leave_time?: string | null;
            duration_seconds?: number;
            duration_formatted?: string;
            is_active?: boolean;
          }>;
          sessions: Array<{
            join_time: string;
            leave_time: string | null;
            duration_formatted: string;
            position_start: number;
            position_end: number;
            position_width: number;
            is_active: boolean;
          }>;
        }>;
      }>;
    };
    upcoming_meetings: {
      count: number;
      meetings: Array<{
        id: string | number;
        topic: string;
        start_time: string;
        duration: number;
        join_url: string;
      }>;
    };
    recent_past_meetings: {
      count: number;
      meetings: Array<{
        id: string | number;
        topic: string;
        start_time: string;
        duration: number;
        course_title: string | null;
      }>;
    };
    timestamp: string;
  };
}

export const zoomApi = createApi({
  reducerPath: 'zoomApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ZoomDashboard'],
  endpoints: (builder) => ({
    // Zoom 대시보드 요약 정보 조회
    getDashboardSummary: builder.query<ZoomDashboardSummary, void>({
      query: () => '/admin/zoom/dashboard-summary',
      transformResponse: (response: any): ZoomDashboardSummary => {
        console.log('API 응답 원본:', response);
        
        // 응답 구조 확인
        if (!response || !response.data) {
          console.error('API 응답에 data 속성이 없음:', response);
          // 오류 발생 시 기본 값 반환
          return {
            success: false,
            message: '데이터를 불러오는 중 오류가 발생했습니다.',
            data: {
              live_meetings: {
                count: 0,
                meetings: []
              },
              upcoming_meetings: {
                count: 0,
                meetings: []
              },
              recent_past_meetings: {
                count: 0,
                meetings: []
              },
              timestamp: new Date().toISOString()
            }
          };
        }
        
        try {
          // 백엔드 응답을 프론트엔드 형식으로 변환
          return {
            success: response.success,
            message: response.message,
            data: {
              live_meetings: {
                count: response.data.live_meetings?.count || 0,
                meetings: response.data.live_meetings?.meetings?.map((liveMeeting: any) => ({
                  id: liveMeeting.id?.toString() || '',
                  topic: liveMeeting.topic || '',
                  host_id: liveMeeting.host_id || '',
                  start_time: liveMeeting.start_time || '',
                  duration: liveMeeting.duration || 0,
                  course_title: liveMeeting.course_title,
                  enrolled_students_count: liveMeeting.enrolled_students_count || 0,
                  current_attendance_rate: liveMeeting.current_attendance_rate || '0',
                  active_participants_count: liveMeeting.active_participants_count || 0,
                  total_participants_count: liveMeeting.total_participants_count || 0,
                  meeting_duration_minutes: liveMeeting.meeting_duration_minutes || 0,
                  meeting_duration_formatted: liveMeeting.meeting_duration_formatted || '0분',
                  meeting_info: {
                    start_time: liveMeeting.start_time || '',
                    duration_formatted: liveMeeting.meeting_duration_formatted || '0분',
                    duration_seconds: (liveMeeting.duration || 0) * 60,
                    duration_minutes: liveMeeting.duration || 0
                  },
                  active_participants: (liveMeeting.active_participants || []).map((participant: any) => ({
                    name: participant.name || '',
                    email: participant.email || '',
                    duration_minutes: participant.duration_minutes || 0,
                    duration_formatted: participant.duration_formatted || '0분',
                    first_join_time: participant.first_join_time || '',
                    is_active: participant.is_active || false,
                    session_count: participant.session_count || 1,
                    attendance_rate: participant.attendance_rate || 0,
                    timeline_data: participant.timeline_data || [],
                    sessions: participant.sessions || []
                  })),
                  recent_past_participants: (liveMeeting.recent_past_participants || []).map((participant: any) => ({
                    name: participant.name || '',
                    email: participant.email || '',
                    duration_minutes: participant.duration_minutes || 0,
                    duration_formatted: participant.duration_formatted || '0분',
                    first_join_time: participant.first_join_time || '',
                    last_leave_time: participant.last_leave_time || '',
                    is_active: participant.is_active || false,
                    session_count: participant.session_count || 1,
                    attendance_rate: participant.attendance_rate || 0,
                    timeline_data: participant.timeline_data || [],
                    sessions: participant.sessions || []
                  })),
                  all_participants: liveMeeting.all_participants || []
                })) || []
              },
              upcoming_meetings: {
                count: response.data.upcoming_meetings?.count || 0,
                meetings: response.data.upcoming_meetings?.meetings?.map((meeting: any) => ({
                  id: meeting.id?.toString() || '',
                  topic: meeting.topic || '',
                  start_time: meeting.start_time || '',
                  duration: meeting.duration || 0,
                  join_url: meeting.join_url || '',
                })) || []
              },
              recent_past_meetings: {
                count: response.data.recent_past_meetings?.count || 0,
                meetings: response.data.recent_past_meetings?.meetings?.map((meeting: any) => ({
                  id: meeting.id?.toString() || '',
                  topic: meeting.topic || '',
                  start_time: meeting.start_time || '',
                  duration: meeting.duration || 0,
                  course_title: meeting.course_title,
                })) || []
              },
              timestamp: response.data.timestamp || new Date().toISOString(),
            },
          };
        } catch (error) {
          console.error('API 응답 변환 중 오류 발생:', error);
          // 오류 발생 시 기본 값 반환
          return {
            success: false,
            message: '데이터를 처리하는 중 오류가 발생했습니다.',
            data: {
              live_meetings: {
                count: 0,
                meetings: []
              },
              upcoming_meetings: {
                count: 0,
                meetings: []
              },
              recent_past_meetings: {
                count: 0,
                meetings: []
              },
              timestamp: new Date().toISOString()
            }
          };
        }
      },
      providesTags: ['ZoomDashboard'],
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = zoomApi; 