import { useState, useEffect } from 'react';

interface AttendanceTimerState {
  courseId: string;
  startTime: number;
  elapsedTime: number; // 초 단위 누적 시간
  isRunning: boolean;
  date: string; // 날짜 정보 추가
}

// 날짜별로 구분되는 스토리지 키 생성 함수
const getTimerStorageKey = (date?: string) => {
  const today = date || new Date().toISOString().split('T')[0];
  return `offline_attendance_timer_${today}`;
};

/**
 * 오프라인 수업 출석 시간 측정 훅
 * localStorage를 사용하여 페이지 이동 시에도 시간 측정을 유지
 * 날짜별로 자동 초기화
 */
export const useAttendanceTimer = () => {
  const [timerState, setTimerState] = useState<AttendanceTimerState | null>(null);
  
  // 초기 로드 시 localStorage에서 타이머 상태 복원
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = getTimerStorageKey(today);
    const storedTimer = localStorage.getItem(storageKey);
    
    if (storedTimer) {
      const parsedTimer = JSON.parse(storedTimer) as AttendanceTimerState;
      // 날짜가 같은 경우에만 복원
      if (parsedTimer.date === today) {
      setTimerState(parsedTimer);
    }
    }
    
    // 이전 날짜의 타이머 데이터 정리
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('offline_attendance_timer_') && key !== storageKey) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  // 타이머 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (timerState) {
      const storageKey = getTimerStorageKey(timerState.date);
      localStorage.setItem(storageKey, JSON.stringify(timerState));
    }
  }, [timerState]);

  // 타이머 업데이트 로직
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerState?.isRunning) {
      interval = setInterval(() => {
        setTimerState(prev => {
          if (!prev) return null;
          
          // 날짜가 바뀌었는지 확인
          const today = new Date().toISOString().split('T')[0];
          if (prev.date !== today) {
            // 날짜가 바뀌면 새로운 타이머 시작
            return {
              courseId: prev.courseId,
              startTime: Date.now(),
              elapsedTime: 0,
              isRunning: true,
              date: today
            };
          }
          
          return {
            ...prev,
            elapsedTime: prev.elapsedTime + 1
          };
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState?.isRunning]);

  // 타이머 시작
  const startTimer = (courseId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = getTimerStorageKey(today);
    
    // 이미 실행 중인 타이머가 있는지 확인
    const existingTimer = localStorage.getItem(storageKey);
    if (existingTimer) {
      const parsedTimer = JSON.parse(existingTimer) as AttendanceTimerState;
      // 같은 날짜의 같은 과목 타이머가 실행 중이면 기존 타이머를 유지
      if (parsedTimer.isRunning && parsedTimer.courseId === courseId && parsedTimer.date === today) {
        return;
      }
    }
    
    // 새 타이머 시작
    setTimerState({
      courseId,
      startTime: Date.now(),
      elapsedTime: 0,
      isRunning: true,
      date: today
    });
  };

  // 타이머 정지
  const stopTimer = () => {
    setTimerState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        isRunning: false
      };
    });
  };

  // 타이머 재개
  const resumeTimer = () => {
    setTimerState(prev => {
      if (!prev) return null;
      
      // 날짜가 바뀌었으면 새로 시작
      const today = new Date().toISOString().split('T')[0];
      if (prev.date !== today) {
        return {
          courseId: prev.courseId,
          startTime: Date.now(),
          elapsedTime: 0,
          isRunning: true,
          date: today
        };
      }
      
      return {
        ...prev,
        isRunning: true
      };
    });
  };

  // 타이머 리셋
  const resetTimer = () => {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = getTimerStorageKey(today);
    localStorage.removeItem(storageKey);
    setTimerState(null);
  };

  // 현재 시간 포맷팅 (시:분:초)
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isTimerRunning: timerState?.isRunning || false,
    courseId: timerState?.courseId || '',
    elapsedTime: timerState?.elapsedTime || 0,
    formattedTime: formatTime(timerState?.elapsedTime || 0),
    startTimer,
    stopTimer,
    resumeTimer,
    resetTimer
  };
};
