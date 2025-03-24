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
  start_time: string;
  duration: number;
  course_id: string | null;
  course_title: string | null;
  participant_count: number;
  participants: Array<{
    name: string;
    email: string;
    join_time: string;
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

// 프론트엔드에서 사용할 변환된 인터페이스
export interface ZoomDashboardSummary {
  accountInfo: {
    email: string;
    name: string;
  };
  activeMeetings: {
    id: string;
    topic: string;
    startTime: string;
    course_id: string | null;
    course_title: string | null;
    participants: {
      id: string;
      name: string;
      email: string;
      joinTime: string;
    }[];
  }[];
  upcomingMeetings: {
    id: string;
    topic: string;
    startTime: string;
    duration: number;
    join_url?: string;
  }[];
  recentMeetings: {
    id: string;
    topic: string;
    startTime: string;
    endTime: string;
    participants: number;
  }[];
  courseMeetings: {
    id: string;
    courseId: string;
    courseName: string;
    topic: string;
    startTime: string;
    status: 'waiting' | 'started' | 'finished';
  }[];
}

export const zoomApi = createApi({
  reducerPath: 'zoomApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ZoomDashboard'],
  endpoints: (builder) => ({
    // Zoom 대시보드 요약 정보 조회
    getDashboardSummary: builder.query<ZoomDashboardSummary, void>({
      query: () => '/admin/zoom/dashboard-summary',
      transformResponse: (response: ZoomDashboardSummaryResponse): ZoomDashboardSummary => {
        const { data } = response;
        
        // 백엔드 응답을 프론트엔드 형식으로 변환
        return {
          accountInfo: { email: '', name: '' }, // 새 API에는 account_info가 없으므로 빈 객체 반환
          activeMeetings: data.live_meetings.meetings.map(liveMeeting => ({
            id: liveMeeting.id.toString(),
            topic: liveMeeting.topic,
            startTime: liveMeeting.start_time,
            course_id: liveMeeting.course_id,
            course_title: liveMeeting.course_title,
            participants: liveMeeting.participants.map(participant => ({
              id: '', // 새 API에는 참가자 ID가 없음
              name: participant.name || '',
              email: participant.email || '',
              joinTime: participant.join_time || new Date().toISOString(),
            })),
          })),
          upcomingMeetings: data.upcoming_meetings.meetings.map(meeting => ({
            id: meeting.id.toString(),
            topic: meeting.topic,
            startTime: meeting.start_time,
            duration: meeting.duration,
            join_url: meeting.join_url,
          })),
          recentMeetings: data.recent_past_meetings.meetings.map(meeting => ({
            id: meeting.id.toString(),
            topic: meeting.topic,
            startTime: meeting.start_time,
            // 종료 시간은 시작 시간 + 지속 시간으로 계산
            endTime: new Date(new Date(meeting.start_time).getTime() + meeting.duration * 60000).toISOString(),
            participants: 0, // 백엔드에서 참가자 수를 제공하지 않음
          })),
          courseMeetings: [], // 새 API에는 course_meetings가 없으므로 빈 배열 반환
        };
      },
      providesTags: ['ZoomDashboard'],
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = zoomApi; 