import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Collapse, List, Button, Spin, Alert, Space } from 'antd';
import { 
  FolderOutlined, 
  FileTextOutlined,
  PlayCircleOutlined,
  DownloadOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import { listCategories, getDownloadUrl } from '@/services/api/courses';
import { S3Structure } from '@/types/s3';

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface WeeklyContent {
  weekNumber: string;
  path: string;
  contents?: {
    folders: S3Structure[];
    files: S3Structure[];
  };
}

const CourseMaterials: FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeklyFolders, setWeeklyFolders] = useState<WeeklyContent[]>([]);

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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  useEffect(() => {
    const loadCourseContents = async () => {
      try {
        setLoading(true);
        setError(null);
        const coursePath = `AI_ML/${courseId}`;
        const response = await listCategories(coursePath);
        const weekFolders = response.folders
          .filter(folder => /^week\d+$/.test(folder.name))
          .map(folder => ({
            weekNumber: folder.name.replace('week', ''),
            path: `${coursePath}/${folder.name}`,
            contents: { folders: [], files: [] }
          }))
          .sort((a, b) => parseInt(a.weekNumber) - parseInt(b.weekNumber));
        const weeklyContents = await Promise.all(
          weekFolders.map(async (week) => {
            const weekContents = await listCategories(week.path);
            return { ...week, contents: weekContents };
          })
        );
        setWeeklyFolders(weeklyContents);
      } catch (err) {
        setError('강의 자료를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    if (courseId) loadCourseContents();
  }, [courseId]);

  const handleFileClick = async (file: S3Structure) => {
    try {
      const response = await getDownloadUrl(file.path);
      window.open(response.presignedUrl, '_blank');
    } catch (error) {
      // 에러 핸들링
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><Spin size="large" tip="자료를 불러오는 중..." /></div>;
  }
  if (error) {
    return <div className="p-6"><Alert message="오류 발생" description={error} type="error" showIcon /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Title level={3} className="mb-4">강의 자료실</Title>
      <Collapse defaultActiveKey={['1']}>
        {weeklyFolders.map((week) => (
          <Panel
            key={week.weekNumber}
            header={
              <Space>
                <FolderOutlined className="text-blue-500" />
                <span className="font-medium">Week {week.weekNumber}</span>
                <span className="text-gray-400">({(week.contents?.files.length || 0)} files)</span>
              </Space>
            }
          >
            <List
              dataSource={week.contents?.files || []}
              renderItem={file => (
                <List.Item
                  actions={[
                    <Button
                      key="download"
                      type="text"
                      icon={<DownloadOutlined />}
                      onClick={() => handleFileClick(file)}
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
                        <Text type="secondary">{formatFileSize(file.size)}</Text>
                        {file.lastModified && (
                          <Text type="secondary">{new Date(file.lastModified).toLocaleDateString()}</Text>
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
  );
};

export default CourseMaterials; 