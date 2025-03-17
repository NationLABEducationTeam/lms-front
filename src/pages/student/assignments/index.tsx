import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllAssignmentsQuery } from '@/services/api/studentApi';
import { Card, Space, Table, Tag, Button, Input, Select, Spin, Alert, Empty, Typography } from 'antd';
import { SearchOutlined, FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, BarChartOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import type { Assignment } from '@/services/api/studentApi';

const { Title, Text } = Typography;
const { Option } = Select;

const AssignmentListPage: FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const { data: assignments, isLoading, error } = useGetAllAssignmentsQuery();
  
  // 날짜 형식화 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // 필터링된 과제 목록
  const filteredAssignments = assignments?.filter(item => {
    // 검색어 필터
    const matchesSearch = searchText === '' || 
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.course_title.toLowerCase().includes(searchText.toLowerCase());
    
    // 상태 필터
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'completed' && item.is_completed) ||
      (statusFilter === 'pending' && !item.is_completed && item.status === '진행중') ||
      (statusFilter === 'overdue' && item.status === '마감됨' && !item.is_completed);
    
    // 유형 필터
    const matchesType = typeFilter === 'all' || 
      (item.item_type.toLowerCase() === typeFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  // 상태에 따른 태그 반환
  const getStatusTag = (record: Assignment) => {
    if (record.is_completed) {
      return <Tag color="success">완료</Tag>;
    } else if (record.status === '마감됨') {
      return <Tag color="error">마감</Tag>;
    } else {
      return <Tag color="processing">진행중</Tag>;
    }
  };
  
  // 유형에 따른 아이콘 반환
  const getTypeIcon = (type: string) => {
    switch(type.toUpperCase()) {
      case 'QUIZ':
        return <Tag color="purple" style={{ minWidth: '80px', textAlign: 'center' }}>퀴즈</Tag>;
      case 'EXAM':
        return <Tag color="magenta" style={{ minWidth: '80px', textAlign: 'center' }}>시험</Tag>;
      case 'ASSIGNMENT':
      default:
        return <Tag color="blue" style={{ minWidth: '80px', textAlign: 'center' }}>과제</Tag>;
    }
  };
  
  const columns: TableProps<Assignment>['columns'] = [
    {
      title: '유형',
      dataIndex: 'item_type',
      key: 'item_type',
      width: 100,
      render: (type: string) => getTypeIcon(type),
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Assignment) => (
        <a onClick={() => navigate(`/assignments/${record.item_id}`)}>{text}</a>
      ),
    },
    {
      title: '과목',
      dataIndex: 'course_title',
      key: 'course_title',
      render: (text: string, record: Assignment) => (
        <span>{text}</span>
      ),
    },
    {
      title: '마감일',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string) => formatDate(date),
      sorter: (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
    },
    {
      title: '상태',
      key: 'status',
      render: (_, record: Assignment) => getStatusTag(record),
    },
    {
      title: '점수',
      dataIndex: 'score',
      key: 'score',
      render: (score: number, record: Assignment) => (
        record.is_completed ? 
          <Text strong>{score}</Text> : 
          <Text type="secondary">-</Text>
      ),
    },
    {
      title: '작업',
      key: 'action',
      render: (_, record: Assignment) => (
        <Button 
          type={record.is_completed ? "default" : "primary"} 
          size="small"
          onClick={() => navigate(`/assignments/${record.item_id}`)}
        >
          {record.is_completed ? '확인' : (record.status === '마감됨' ? '상세보기' : '제출')}
        </Button>
      ),
    },
  ];
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8">
        <Alert 
          type="error" 
          message="오류 발생" 
          description="과제 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
          showIcon
        />
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Title level={2} className="mb-2">과제 및 퀴즈</Title>
          <Text type="secondary">모든 과목의 과제, 퀴즈, 시험 목록입니다.</Text>
        </div>
        
        <Card className="mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Input 
                placeholder="제목, 과목명 검색" 
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                style={{ maxWidth: 250 }}
              />
              <Select
                value={statusFilter}
                onChange={value => setStatusFilter(value)}
                style={{ width: 150 }}
              >
                <Option value="all">모든 상태</Option>
                <Option value="pending">진행중</Option>
                <Option value="completed">완료</Option>
                <Option value="overdue">마감됨</Option>
              </Select>
              <Select
                value={typeFilter}
                onChange={value => setTypeFilter(value)}
                style={{ width: 150 }}
              >
                <Option value="all">모든 유형</Option>
                <Option value="assignment">과제</Option>
                <Option value="quiz">퀴즈</Option>
                <Option value="exam">시험</Option>
              </Select>
            </div>
          </div>
        </Card>
        
        {!assignments || assignments.length === 0 ? (
          <Card>
            <Empty 
              description="과제 목록이 없습니다" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <Card bordered={false} className="shadow-sm">
            <Table 
              columns={columns} 
              dataSource={filteredAssignments} 
              rowKey="item_id"
              pagination={{
                defaultPageSize: 10,
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}개 항목`,
              }}
              loading={isLoading}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      searchText || statusFilter !== 'all' || typeFilter !== 'all'
                        ? '검색 결과가 없습니다'
                        : '과제 목록이 없습니다'
                    }
                  />
                )
              }}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default AssignmentListPage; 