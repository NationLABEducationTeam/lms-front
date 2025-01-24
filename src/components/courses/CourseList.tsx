import { FC, useMemo, useState } from 'react';
import { Course, CATEGORY_MAPPING } from '@/types/course';
import { Card, Tag, Button, Typography, Space, Tooltip, Select } from 'antd';
import { BookOutlined, RightOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;
const { Option } = Select;

interface CourseListProps {
  courses: Course[];
  userRole: string;
  onJoinClass: (courseId: string) => void;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}

export const CourseList: FC<CourseListProps> = ({
  courses,
  userRole,
  onJoinClass,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');

  // 카테고리 목록 추출
  const { mainCategories, subCategories } = useMemo(() => {
    const mainCats = new Set<string>();
    const subCats = new Set<string>();
    
    courses.forEach(course => {
      mainCats.add(course.main_category_id);
      subCats.add(course.sub_category_id);
    });
    
    return {
      mainCategories: Array.from(mainCats),
      subCategories: Array.from(subCats)
    };
  }, [courses]);

  // 필터링된 강의 목록
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchMainCategory = !selectedMainCategory || course.main_category_id === selectedMainCategory;
      const matchSubCategory = !selectedSubCategory || course.sub_category_id === selectedSubCategory;
      return matchMainCategory && matchSubCategory;
    });
  }, [courses, selectedMainCategory, selectedSubCategory]);

  const getCategoryLabel = (category: string) => {
    if (category in CATEGORY_MAPPING) {
      return CATEGORY_MAPPING[category as keyof typeof CATEGORY_MAPPING];
    }
    return category;
  };

  const getTagColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'CLOUD': 'blue',
      'AI_ML': 'purple',
      'WEB': 'green',
      'AUTOMATION': 'orange',
      'DEVOPS': 'cyan',
      'DataEngineering': 'magenta',
      'CodeingTest': 'gold'
    };
    return colors[category] || 'default';
  };

  const handleCourseClick = (course: Course) => {
    navigate(`/courses/${course.id}`);
  };

  if (!courses.length) {
    return (
      <div className="text-center p-8 bg-white rounded-lg">
        <Text type="secondary">등록된 강의가 없습니다.</Text>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 필터 섹션 */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-4">
          <Select
            placeholder="대분류 선택"
            style={{ width: 200 }}
            allowClear
            onChange={value => setSelectedMainCategory(value)}
          >
            {mainCategories.map(category => (
              <Option key={category} value={category}>
                {getCategoryLabel(category)}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="소분류 선택"
            style={{ width: 200 }}
            allowClear
            onChange={value => setSelectedSubCategory(value)}
          >
            {subCategories.map(category => (
              <Option key={category} value={category}>
                {getCategoryLabel(category)}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* 강의 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => (
          <Card
            key={course.id}
            hoverable
            className="h-full cursor-pointer"
            onClick={() => handleCourseClick(course)}
            actions={[
              <Tooltip title="강의실 입장" key="join">
                <Button 
                  type="text" 
                  icon={<RightOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onJoinClass(course.id);
                  }}
                >
                  입장
                </Button>
              </Tooltip>,
              ...(userRole === 'ADMIN' ? [
                <Tooltip title="강의 수정" key="edit">
                  <Button 
                    type="text" 
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(course);
                    }}
                  >
                    수정
                  </Button>
                </Tooltip>,
                <Tooltip title="강의 삭제" key="delete">
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(course);
                    }}
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
                    color: '#1890ff',
                    background: '#e6f7ff',
                    padding: '8px',
                    borderRadius: '8px'
                  }} 
                />
              }
              title={
                <div>
                  <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                    {course.title}
                  </Text>
                  <Space size={[0, 8]} wrap>
                    <Tag color={getTagColor(course.main_category_id)}>
                      {getCategoryLabel(course.main_category_id)}
                    </Tag>
                    <Tag color="default">
                      {getCategoryLabel(course.sub_category_id)}
                    </Tag>
                  </Space>
                </div>
              }
              description={
                <Space direction="vertical" size="small" className="mt-2">
                  <Text type="secondary" className="line-clamp-2">
                    {course.description}
                  </Text>
                  <Space className="mt-2">
                    <Space>
                      <CalendarOutlined style={{ color: '#1890ff' }} />
                      <Text type="secondary">16주 과정</Text>
                    </Space>
                    <Space>
                      <TeamOutlined style={{ color: '#1890ff' }} />
                      <Text type="secondary">수강생 0명</Text>
                    </Space>
                  </Space>
                </Space>
              }
            />
          </Card>
        ))}
      </div>
    </div>
  );
}; 