import React, { FC, useEffect, useState, useMemo, useCallback, memo } from 'react';
import { Card, Select, Spin, Empty, Progress, Tag, Statistic, Space } from 'antd';
import {
  FileProtectOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  BulbOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Course } from '@/types/course';
import { getStudentGrades, NewStudentGrades } from '@/services/api/studentApi';

interface CourseStatsCardProps {
  courses: Course[];
  selectedCourseId: string;
  onCourseChange: (courseId: string) => void;
}

const CourseStatsCard: FC<CourseStatsCardProps> = memo(({ 
  courses, 
  selectedCourseId, 
  onCourseChange 
}) => {
  const navigate = useNavigate();
  const [gradeData, setGradeData] = useState<NewStudentGrades | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<Record<string, NewStudentGrades>>({});

  // 날짜 포맷팅 함수 메모이제이션
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }, []);

  // 성적 데이터 페칭 함수 메모이제이션
  const fetchGradeData = useCallback(async (courseId: string) => {
    // 캐시에서 먼저 확인
    if (cache[courseId]) {
      console.log('캐시에서 성적 데이터 로드:', courseId);
      setGradeData(cache[courseId]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('API에서 성적 데이터 로드:', courseId);
      const data = await getStudentGrades(courseId);
      setGradeData(data);
      
      // 캐시에 저장 (5분간 유효)
      setCache(prev => ({
        ...prev,
        [courseId]: data
      }));
      
      // 5분 후 캐시 삭제
      setTimeout(() => {
        setCache(prev => {
          const newCache = { ...prev };
          delete newCache[courseId];
          return newCache;
        });
      }, 5 * 60 * 1000);
      
    } catch (err) {
      console.error('성적 데이터 로드 실패:', err);
      setError('성적 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [cache]);

  // selectedCourseId 변경 시에만 API 호출
  useEffect(() => {
    if (!selectedCourseId) {
      setGradeData(null);
      return;
    }

    fetchGradeData(selectedCourseId);
  }, [selectedCourseId, fetchGradeData]);

  // 최근 성적 항목 계산 메모이제이션
  const recentGradeItems = useMemo(() => {
    if (!gradeData?.grades) return [];

    const allItems = [
      ...(gradeData.grades.assignments || []),
      ...((gradeData.course?.exam_count || 0) > 0 && (gradeData.grades.exams?.length || 0) > 0 ? (gradeData.grades.exams || []) : [])
    ]
    .filter(item => item)
    .filter(item => !(item.type === 'EXAM' && (gradeData.course?.exam_count || 0) === 0))
    .sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

    return allItems;
  }, [gradeData]);

  // 네비게이션 핸들러 메모이제이션
  const handleNavigateToGrades = useCallback(() => {
    navigate(`/courses/${selectedCourseId}/grades`);
  }, [navigate, selectedCourseId]);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* 카드 헤더 */}
      <div className="flex justify-between items-center p-5 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <FileProtectOutlined className="text-dashboard-primary text-lg" />
          </div>
          <h3 className="text-lg font-semibold text-dashboard-text-primary">성적 정보</h3>
        </div>

        {/* 과목 선택 드롭다운 */}
        <Select
          style={{ width: 200 }}
          placeholder="강의 선택"
          value={selectedCourseId || undefined}
          onChange={onCourseChange}
          className="border-gray-200"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            String(option?.children)?.toLowerCase().includes(input.toLowerCase())
          }
        >
          {courses.map(course => (
            <Select.Option key={course.id} value={course.id}>
              {course.title}
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* 카드 내용 */}
      <div className="p-5">
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Spin size="large" tip="성적 정보를 불러오는 중..." />
          </div>
        ) : error ? (
          <div className="py-10 text-center">
            <Empty 
              description={error}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <button 
              onClick={() => selectedCourseId && fetchGradeData(selectedCourseId)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : !gradeData || !selectedCourseId ? (
          <div className="py-10">
            <Empty 
              description="강의를 선택하세요"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* 과목 정보 헤더 */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-semibold text-dashboard-primary">
                  {gradeData?.course?.title || "강의 정보"}
                </h4>
                <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                  총 {gradeData?.course?.weeks_count || 0}주차
                </div>
              </div>
              
              <div className={`grid ${(gradeData?.course?.exam_count || 0) > 0 ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
                <div className="text-center p-2 rounded-lg bg-white/60 shadow-sm">
                  <div className="text-xs text-dashboard-text-secondary mb-1">출석 반영</div>
                  <div className="font-bold text-dashboard-primary">
                    {gradeData?.course?.attendance_weight || 0}%
                  </div>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/60 shadow-sm">
                  <div className="text-xs text-dashboard-text-secondary mb-1">과제 반영</div>
                  <div className="font-bold text-dashboard-primary">
                    {gradeData?.course?.assignment_weight || 0}%
                  </div>
                </div>
                {(gradeData?.course?.exam_count || 0) > 0 && (
                  <div className="text-center p-2 rounded-lg bg-white/60 shadow-sm">
                    <div className="text-xs text-dashboard-text-secondary mb-1">시험 반영</div>
                    <div className="font-bold text-dashboard-primary">
                      {gradeData?.course?.exam_weight || 0}%
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 성적 요약 */}
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <div className="text-dashboard-text-secondary font-medium">총점</div>
                <div className="text-2xl font-bold text-dashboard-gradient-from">
                  {gradeData?.grades?.total_score || 0}점
                </div>
              </div>
              <Progress 
                percent={Math.min(gradeData?.grades?.total_score || 0, 100)} 
                status="active"
                strokeColor={{
                  '0%': '#3F5CF7',
                  '100%': '#6C4EF8'
                }}
                className="mt-1"
              />
            </div>

            {/* 카테고리별 성적 상세 */}
            <div className="grid grid-cols-1 gap-4">
              {/* 출석 */}
              <div className="p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircleOutlined className="text-dashboard-success" />
                  </div>
                  <h4 className="font-semibold text-dashboard-text-primary">진도</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-dashboard-text-secondary mb-1">진도율</div>
                    <div className="text-xl font-semibold text-dashboard-success">
                      {gradeData?.grades?.attendance?.rate || 0}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-dashboard-text-secondary mb-1">진도 점수</div>
                    <div className="text-xl font-semibold text-dashboard-text-primary">
                      {gradeData?.grades?.attendance?.score || 0}점
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-dashboard-text-secondary">
                  총 세션: {gradeData?.grades?.attendance?.totalSessions || 0}회
                </div>
              </div>

              {/* 과제 */}
              <div className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileTextOutlined className="text-dashboard-primary" />
                  </div>
                  <h4 className="font-semibold text-dashboard-text-primary">과제</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-dashboard-text-secondary mb-1">과제 점수</div>
                    <div className="text-xl font-semibold text-dashboard-primary">
                      {gradeData?.grades?.assignment_score || 0}점
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-dashboard-text-secondary mb-1">완료율</div>
                    <div className="text-xl font-semibold text-dashboard-text-primary">
                      {gradeData?.grades?.assignment_completion_rate || 0}%
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-dashboard-text-secondary">
                  진행 상황: {gradeData?.grades?.assignments ? 
                    gradeData.grades.assignments.filter(a => a.isCompleted === true).length : 0}/{gradeData?.course?.assignment_count || 0} 완료
                </div>
              </div>

              {/* 시험 - exam_count가 0인 경우에만 숨김 */}
              {(gradeData?.course?.exam_count || 0) > 0 && (
                <div className="p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <BulbOutlined className="text-dashboard-secondary" />
                    </div>
                    <h4 className="font-semibold text-dashboard-text-primary">시험</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm text-dashboard-text-secondary mb-1">시험 점수</div>
                      <div className="text-xl font-semibold text-dashboard-secondary">
                        {gradeData?.grades?.exam_score || 0}점
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-dashboard-text-secondary mb-1">완료율</div>
                      <div className="text-xl font-semibold text-dashboard-text-primary">
                        {gradeData?.grades?.exam_completion_rate || 0}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-dashboard-text-secondary">
                    진행 상황: {gradeData?.grades?.exams?.filter(e => e.isCompleted === true).length ?? 0}/{gradeData?.course?.exam_count || 0} 완료
                  </div>
                </div>
              )}
            </div>

            {/* 전체 진행률 */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium text-dashboard-text-primary">전체 진행률</div>
                <div className="font-medium text-dashboard-primary">{gradeData?.grades?.progress_rate || 0}%</div>
              </div>
              <Progress 
                percent={Math.min(gradeData?.grades?.progress_rate || 0, 100)}
                size="small"
                strokeColor={{
                  '0%': '#3F5CF7',
                  '100%': '#6C4EF8'
                }}
              />
            </div>

            {/* 최근 성적 항목 */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-dashboard-text-primary">최근 성적 항목</h4>
                <button 
                  onClick={handleNavigateToGrades}
                  className="text-dashboard-primary hover:text-dashboard-secondary text-sm transition-colors"
                >
                  모두 보기
                </button>
              </div>

              {recentGradeItems.length === 0 ? (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  description="성적 항목이 없습니다"
                  className="my-4"
                />
              ) : (
                <div className="space-y-2">
                  {recentGradeItems.map((item, idx) => (
                    <div 
                      key={`${item.id}-${idx}`}
                      className="p-3 rounded-lg border border-gray-100 hover:border-dashboard-primary rounded-xl flex items-center space-x-3 cursor-pointer transition-all hover:shadow-md"
                    >
                      <div className={`w-6 h-6 rounded-full flex-shrink-0 
                        ${item.type === 'ASSIGNMENT' ? 'bg-blue-50' : 'bg-purple-50'}`}
                      >
                        {item.type === 'ASSIGNMENT' ? (
                          <FileTextOutlined className="text-dashboard-primary text-xs" />
                        ) : (
                          <BulbOutlined className="text-dashboard-secondary text-xs" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-dashboard-text-primary truncate group-hover:text-dashboard-primary transition-colors">
                          {item.title}
                        </h4>
                        <div className="text-sm text-dashboard-text-secondary truncate">
                          {item.score}점
                        </div>
                        <div className={`text-sm mt-1
                          ${item.isCompleted ? 'text-green-600' : 'text-dashboard-text-secondary'}`}
                        >
                          {item.dueDate ? formatDate(item.dueDate) : '마감일 없음'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

CourseStatsCard.displayName = 'CourseStatsCard';

export default CourseStatsCard; 