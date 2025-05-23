import React, { FC } from 'react';
import { Empty, Spin, Alert } from 'antd';
import { EditOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Assignment, useGetCourseAssignmentsQuery } from '@/services/api/studentApi';
import { FileDoneOutlined, BulbOutlined, FileTextOutlined } from '@ant-design/icons';

interface AssignmentSectionProps {
  selectedCourseId: string;
}

const AssignmentSection: FC<AssignmentSectionProps> = ({ selectedCourseId }) => {
  const navigate = useNavigate();
  
  const { 
    data: assignments = [], 
    isLoading: assignmentsLoading, 
    error: assignmentsError 
  } = useGetCourseAssignmentsQuery(selectedCourseId, {
    skip: !selectedCourseId
  });

  // 과제 타입에 따른 아이콘 반환
  const getAssignmentIcon = (type: string) => {
    switch(type) {
      case 'QUIZ':
        return <BulbOutlined style={{ color: '#722ed1', fontSize: 24 }} />;
      case 'EXAM':
        return <FileDoneOutlined style={{ color: '#eb2f96', fontSize: 24 }} />;
      case 'ASSIGNMENT':
      default:
        return <FileTextOutlined style={{ color: '#1677ff', fontSize: 24 }} />;
    }
  };

  // 날짜 형식화 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 마감일까지 남은 날짜 계산
  const getDaysLeft = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '마감됨';
    if (diffDays === 0) return '오늘 마감';
    return `${diffDays}일 남음`;
  };

  // 과제 목록이 있으면 필터링, 없으면 빈 배열 반환
  const upcomingAssignments: Assignment[] = assignments && assignments.length > 0
    ? assignments
        .filter(assignment => 
          assignment.status === '진행중' || 
          (assignment.status === '마감됨' && new Date(assignment.due_date) > new Date(Date.now() - 24 * 60 * 60 * 1000))
        )
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 5)
    : [];

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
      {/* 카드 헤더 */}
      <div className="flex justify-between items-center p-5 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <EditOutlined className="text-dashboard-primary text-lg" />
          </div>
          <h3 className="text-lg font-semibold text-dashboard-text-primary">진행 중인 과제 및 퀴즈</h3>
        </div>
        <button 
          onClick={() => navigate('/assignments')}
          className="text-dashboard-primary hover:text-dashboard-secondary flex items-center space-x-1 transition-colors"
        >
          <span>전체보기</span>
          <RightOutlined />
        </button>
      </div>

      {/* 카드 내용 */}
      <div className="p-5">
        {assignmentsLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spin size="large" />
          </div>
        ) : assignmentsError ? (
          <Alert
            message="데이터 로딩 오류"
            description={`과제 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. (${JSON.stringify(assignmentsError)})`}
            type="error"
            showIcon
          />
        ) : !assignments || assignments.length === 0 ? (
          <Empty description="진행 중인 과제가 없습니다" />
        ) : (
          <>
            <div className="mb-4 text-dashboard-text-secondary">
              총 {assignments.length}개의 과제/퀴즈가 있습니다
            </div>
            
            <div className="space-y-4">
              {upcomingAssignments.map((assignment) => (
                <div
                  key={assignment.item_id}
                  onClick={() => navigate(`/assignments/${assignment.item_id}`)}
                  className="bg-white border border-gray-100 hover:border-dashboard-primary rounded-xl p-4 cursor-pointer transition-all hover:shadow-md group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full flex-shrink-0 
                        ${assignment.item_type === 'QUIZ' ? 'bg-purple-50' : 
                          assignment.item_type === 'EXAM' ? 'bg-pink-50' : 'bg-blue-50'}`}
                      >
                        {getAssignmentIcon(assignment.item_type)}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-dashboard-text-primary group-hover:text-dashboard-primary transition-colors">
                            {assignment.title}
                          </h4>
                          <div className={`text-xs px-2 py-0.5 rounded-full font-medium
                            ${assignment.status === '제출완료' ? 'bg-green-100 text-green-600' : 
                              assignment.status === '마감됨' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
                          >
                            {assignment.status === '제출완료' ? '완료' : 
                             assignment.status === '마감됨' ? '마감' : '진행중'}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                            {assignment.course_title}
                          </span>
                          <span className="text-dashboard-text-secondary">
                            마감일: {formatDate(assignment.due_date)}
                          </span>
                          <span className={`
                            ${assignment.status === '마감됨' ? 'text-red-500' : 
                              getDaysLeft(assignment.due_date) === '오늘 마감' ? 'text-orange-500' : 'text-dashboard-text-secondary'}`}
                          >
                            {getDaysLeft(assignment.due_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      {assignment.is_completed ? (
                        <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                          점수: {assignment.score}
                        </div>
                      ) : (
                        <button className="bg-dashboard-primary hover:bg-dashboard-secondary text-white px-3 py-1 rounded-full text-sm transition-colors">
                          {assignment.status === '마감됨' ? '상세보기' : '제출하기'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AssignmentSection; 