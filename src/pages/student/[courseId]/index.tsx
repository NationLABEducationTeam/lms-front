import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Card, Space, Spin, Alert, Collapse, List, Button } from 'antd';
import { 
  FolderOutlined, 
  CalendarOutlined,
  BookOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  DownloadOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  UserOutlined
} from '@ant-design/icons';
import { getCourseDetail, getDownloadUrl } from '@/services/api/courses';
import { CourseDetail } from '@/types/course';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const CourseDetailPage: FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);

  // 파일 아이콘 선택 함수
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FilePdfOutlined className="text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileWordOutlined className="text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileExcelOutlined className="text-green-500" />;
      case 'mp4':
      case 'mov':
      case 'avi':
        return <PlayCircleOutlined className="text-purple-500" />;
      default:
        return <FileTextOutlined className="text-gray-500" />;
    }
  };

  // 파일 크기 포맷팅 함수
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  useEffect(() => {
    const loadCourseDetail = async () => {
      if (!courseId) return;

      // URL이 /student/{courseId} 형식인지 확인
      const pathSegments = window.location.pathname.split('/');
      if (pathSegments[1] !== 'student' || !pathSegments[2]) return;

      try {
        setLoading(true);
        setError(null);
        const detail = await getCourseDetail(courseId);
        setCourseDetail(detail);
      } catch (err) {
        console.error('Error loading course details:', err);
        setError('강의 내용을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadCourseDetail();
  }, [courseId]);

  const handleFileClick = async (filePath: string) => {
    try {
      const response = await getDownloadUrl(filePath);
      window.open(response.presignedUrl, '_blank');
    } catch (error) {
      console.error('Error getting file URL:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="강의 내용을 불러오는 중..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message="오류 발생"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!courseDetail) {
    return (
      <div className="p-6">
        <Alert
          message="강의를 찾을 수 없음"
          description="요청하신 강의를 찾을 수 없습니다."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 강의 헤더 */}
      <Card className="mb-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <BookOutlined className="text-2xl text-blue-500" />
          </div>
          <div className="flex-grow">
            <Title level={2} className="!mb-1">{courseDetail.courseInfo.title}</Title>
            <Space className="text-gray-500" size="large">
              <Space>
                <UserOutlined />
                <span>{courseDetail.courseInfo.instructor}</span>
              </Space>
              <Space>
                <CalendarOutlined />
                <span>총 {courseDetail.courseInfo.totalWeeks}주차</span>
              </Space>
            </Space>
          </div>
        </div>
        <Text className="block text-gray-600">
          {courseDetail.courseInfo.description}
        </Text>
      </Card>

      {/* 주차별 섹션 */}
      <div className="space-y-4">
        <Collapse defaultActiveKey={['1']}>
          {courseDetail.weeklyContents.map((week) => (
            <Panel
              key={week.weekNumber}
              header={
                <Space>
                  <FolderOutlined className="text-blue-500" />
                  <span className="font-medium">{week.name}</span>
                  <span className="text-gray-400">
                    ({week.files.length} files)
                  </span>
                </Space>
              }
            >
              <List
                dataSource={week.files}
                renderItem={file => (
                  <List.Item
                    actions={[
                      <Button
                        key="download"
                        type="text"
                        icon={<DownloadOutlined />}
                        onClick={() => handleFileClick(file.path)}
                      >
                        Download
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={getFileIcon(file.name)}
                      title={file.name}
                      description={
                        <Space>
                          <Text type="secondary">
                            {formatFileSize(file.size)}
                          </Text>
                          {file.lastModified && (
                            <Text type="secondary">
                              {new Date(file.lastModified).toLocaleDateString()}
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Panel>
          ))}
        </Collapse>
      </div>
    </div>
  );
};

export default CourseDetailPage; 