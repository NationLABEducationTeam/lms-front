import { FC, useMemo } from 'react';
import { Course } from '@/types/course';
import { Collapse, Card, Tag, Button, Typography, Space, Tooltip, theme } from 'antd';
import { BookOutlined, RightOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import type { CollapseProps } from 'antd';

const { Text } = Typography;
const { useToken } = theme;

interface CourseListProps {
  courses: Course[];
  userRole: string;
  onJoinClass: (courseId: string) => void;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}

interface CategoryGroup {
  [key: string]: {
    [key: string]: Course[];
  };
}

export const CourseList: FC<CourseListProps> = ({
  courses,
  userRole,
  onJoinClass,
  onEdit,
  onDelete
}) => {
  const { token } = useToken();

  // 강의를 카테고리별로 그룹화
  const groupedCourses = useMemo(() => {
    const groups: CategoryGroup = {};
    
    courses.forEach(course => {
      const mainCategory = course.mainCategory;
      const subCategory = course.subCategory;
      
      if (!groups[mainCategory]) {
        groups[mainCategory] = {};
      }
      if (!groups[mainCategory][subCategory]) {
        groups[mainCategory][subCategory] = [];
      }
      
      groups[mainCategory][subCategory].push(course);
    });
    
    return groups;
  }, [courses]);

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'artificial-intelligence': '인공지능',
      'computer-vision': '컴퓨터 비전',
      'machine-learning': '머신러닝',
      'certifications': '자격증',
      'aws-certification': 'AWS 자격증',
      'productivity': '생산성',
      'project-management': '프로젝트 관리',
      'programming': '프로그래밍',
      'web-development': '웹 개발'
    };
    return labels[category] || category;
  };

  const getTagColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'artificial-intelligence': 'blue',
      'certifications': 'green',
      'productivity': 'gold',
      'programming': 'purple'
    };
    return colors[category] || 'default';
  };

  const getMainCategoryItems = (): CollapseProps['items'] => {
    return Object.entries(groupedCourses).map(([mainCategory, subCategories]) => ({
      key: mainCategory,
      label: (
        <Space>
          <Tag color={getTagColor(mainCategory)}>{getCategoryLabel(mainCategory)}</Tag>
          <Text strong>{Object.values(subCategories).flat().length}개 강의</Text>
        </Space>
      ),
      children: (
        <Collapse
          items={Object.entries(subCategories).map(([subCategory, courses]) => ({
            key: subCategory,
            label: (
              <Space>
                <Text strong>{getCategoryLabel(subCategory)}</Text>
                <Text type="secondary">{courses.length}개 강의</Text>
              </Space>
            ),
            children: (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <Card
                    key={course.id}
                    hoverable
                    className="h-full"
                    style={{ 
                      background: token.colorBgContainer,
                      borderRadius: token.borderRadiusLG 
                    }}
                    actions={[
                      <Tooltip title="강의실 입장" key="join">
                        <Button 
                          type="text" 
                          icon={<RightOutlined />}
                          onClick={() => onJoinClass(course.id)}
                        >
                          입장
                        </Button>
                      </Tooltip>,
                      // TO-DO: 관리자 권한일 경우 수정, 삭제 버튼 추가
                      ...(userRole === 'ADMIN' ? [
                        <Tooltip title="강의 수정" key="edit">
                          <Button 
                            type="text" 
                            icon={<EditOutlined />}
                            onClick={() => onEdit(course)}
                          >
                            수정
                          </Button>
                        </Tooltip>,
                        <Tooltip title="강의 삭제" key="delete">
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />}
                            onClick={() => onDelete(course)}
                          >
                            삭제
                          </Button>
                        </Tooltip>
                      ] : [])
                    ]}
                  >
                    <Card.Meta
                      avatar={
                        <BookOutlined 
                          style={{ 
                            fontSize: '24px', 
                            color: token.colorPrimary,
                            background: token.colorPrimaryBg,
                            padding: '8px',
                            borderRadius: token.borderRadiusLG
                          }} 
                        />
                      }
                      title={
                        <Text strong style={{ fontSize: token.fontSizeLG }}>
                          {course.title}
                        </Text>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <Space>
                            <CalendarOutlined style={{ color: token.colorPrimary }} />
                            <Text type="secondary">16주 과정</Text>
                          </Space>
                          <Space>
                            <TeamOutlined style={{ color: token.colorPrimary }} />
                            <Text type="secondary">수강생 0명</Text>
                          </Space>
                        </Space>
                      }
                    />
                  </Card>
                ))}
              </div>
            )
          }))}
        />
      )
    }));
  };

  if (!courses.length) {
    return (
      <div className="text-center p-8" style={{ background: token.colorBgContainer, borderRadius: token.borderRadiusLG }}>
        <Text type="secondary">등록된 강의가 없습니다.</Text>
      </div>
    );
  }

  return (
    <Collapse
      defaultActiveKey={Object.keys(groupedCourses)}
      expandIconPosition="end"
      items={getMainCategoryItems()}
      style={{
        background: token.colorBgContainer,
        borderRadius: token.borderRadiusLG
      }}
    />
  );
}; 