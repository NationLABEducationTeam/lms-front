export interface AttendanceRecord {
  courseId: string;
  courseName: string;
  sessionDate: string;
  status: 'present' | 'late' | 'absent';
  duration?: number;  // 수업 참여 시간 (초)
  joinTime?: string;  // Zoom 입장 시간
  leaveTime?: string; // Zoom 퇴장 시간
}

export interface AttendanceStats {
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendanceRate: number;
}

export interface AttendanceResponse {
  records: AttendanceRecord[];
  stats: AttendanceStats;
} 