import { FC, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useGetAssignmentDetailQuery, 
  useSubmitAssignmentMutation,
  useGetAssignmentUploadUrlsMutation,
  Assignment
} from '@/services/api/studentApi';
import { 
  Card, 
  Button, 
  Typography, 
  Descriptions, 
  Tag, 
  Divider, 
  Spin, 
  Alert, 
  Input, 
  Upload, 
  Modal, 
  message, 
  Progress,
  Space 
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { 
  ArrowLeftOutlined, 
  FileTextOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  InboxOutlined,
  LoadingOutlined,
  FileDoneOutlined,
  UploadOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

interface SubmissionFile {
  name: string;
  key: string;
  type: string;
  size: number;
}

const AssignmentDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [submissionText, setSubmissionText] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  
  // API 호출
  const { data: assignment, isLoading, error } = useGetAssignmentDetailQuery(id as string);
  const [submitAssignment] = useSubmitAssignmentMutation();
  const [getUploadUrls] = useGetAssignmentUploadUrlsMutation();
  
  // 파일 업로드 속성
  const uploadProps: UploadProps = {
    onRemove: file => {
      const updatedFileList = fileList.filter(item => item.uid !== file.uid);
      setFileList(updatedFileList);
    },
    beforeUpload: file => {
      setFileList(prev => [...prev, file]);
      return false;
    },
    fileList,
    multiple: true,
    listType: "text"
  };
  
  // 날짜 형식화 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // 제출 가능 상태 확인
  const canSubmit = (): boolean => {
    if (!assignment) return false;
    
    // 이미 제출했거나 마감된 경우
    if (assignment.is_completed || assignment.status === '마감됨') {
      return false;
    }
    
    // 제출 데이터가 있는지 확인
    const hasContent = submissionText.trim().length > 0;
    const hasFiles = fileList.length > 0;
    
    return hasContent || hasFiles;
  };
  
  // 과제 제출 처리
  const handleSubmit = async () => {
    if (!id || !canSubmit()) return;
    
    try {
      setSubmitLoading(true);
      
      // 1. 파일이 있는 경우 업로드 URL 요청
      let uploadedFiles: SubmissionFile[] = [];
      
      if (fileList.length > 0) {
        setUploading(true);
        
        // 파일 정보 준비
        const fileInfos = fileList.map(file => ({
          name: file.name,
          type: file.type as string,
          size: file.size as number
        }));
        
        // 업로드 URL 요청
        const urlsResponse = await getUploadUrls({
          assignmentId: id,
          files: fileInfos
        }).unwrap();
        
        // 파일 업로드
        if (urlsResponse.data && urlsResponse.data.length > 0) {
          await Promise.all(
            urlsResponse.data.map(async ({ fileName, uploadUrl, fileKey }) => {
              const file = fileList.find(f => f.name === fileName);
              if (!file) return;
              
              try {
                // 업로드 진행 상태 표시
                const response = await axios.put(uploadUrl, file, {
                  headers: { 'Content-Type': file.type },
                  onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                      setUploadProgress(prev => ({
                        ...prev,
                        [fileName]: percentCompleted
                      }));
                    }
                  }
                });
                
                // 업로드 완료된 파일 정보 저장
                uploadedFiles.push({
                  name: fileName,
                  key: fileKey,
                  type: file.type as string,
                  size: file.size as number
                });
                
                return response;
              } catch (error) {
                console.error(`Error uploading file ${fileName}:`, error);
                message.error(`${fileName} 업로드 실패`);
                throw error;
              }
            })
          );
        }
      }
      
      // 2. 과제 제출 API 호출
      const submissionData = {
        content: submissionText,
        files: uploadedFiles.length > 0 ? uploadedFiles : undefined
      };
      
      const response = await submitAssignment({
        assignmentId: id,
        submissionData
      }).unwrap();
      
      if (response.success) {
        message.success('과제가 성공적으로 제출되었습니다.');
        setSubmitModalVisible(false);
        // 페이지 새로고침 (최신 데이터 로드)
        window.location.reload();
      } else {
        message.error(response.message || '과제 제출에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      message.error('과제 제출 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
      setSubmitLoading(false);
    }
  };
  
  // 과제 유형에 따른 아이콘 반환
  const getTypeIcon = (type: string) => {
    switch(type.toUpperCase()) {
      case 'QUIZ':
        return <Tag color="purple" style={{ padding: '4px 8px' }}>퀴즈</Tag>;
      case 'EXAM':
        return <Tag color="magenta" style={{ padding: '4px 8px' }}>시험</Tag>;
      case 'ASSIGNMENT':
      default:
        return <Tag color="blue" style={{ padding: '4px 8px' }}>과제</Tag>;
    }
  };
  
  // 과제 상태에 따른 태그 반환
  const getStatusTag = (assignment: Assignment) => {
    if (assignment.is_completed) {
      return <Tag color="success" style={{ padding: '4px 8px' }}>제출 완료</Tag>;
    } else if (assignment.status === '마감됨') {
      return <Tag color="error" style={{ padding: '4px 8px' }}>마감됨</Tag>;
    } else {
      return <Tag color="processing" style={{ padding: '4px 8px' }}>진행중</Tag>;
    }
  };
  
  // 제출 테스트 모달
  const submitModal = (
    <Modal
      title="과제 제출"
      open={submitModalVisible}
      onCancel={() => setSubmitModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setSubmitModalVisible(false)}>
          취소
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={submitLoading}
          onClick={handleSubmit}
        >
          제출하기
        </Button>
      ]}
    >
      <p>작성한 내용과 파일을 제출하시겠습니까?</p>
      <p>제출 후에는 수정이 불가능할 수 있습니다.</p>
    </Modal>
  );
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }
  
  if (error || !assignment) {
    return (
      <div className="p-8">
        <Alert 
          type="error" 
          message="오류 발생" 
          description="과제 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
          showIcon
        />
        <div className="mt-4">
          <Button type="primary" onClick={() => navigate('/assignments')}>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/assignments')}
            className="mb-4"
          >
            과제 목록
          </Button>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            {getTypeIcon(assignment.item_type)}
            <Title level={3} style={{ margin: 0 }}>{assignment.title}</Title>
            {getStatusTag(assignment)}
          </div>
          <Text type="secondary">{assignment.course_title}</Text>
        </div>
        
        {/* 과제 정보 */}
        <Card className="mb-6 shadow-sm">
          <Descriptions title="과제 정보" bordered column={1} layout="vertical">
            <Descriptions.Item label="마감일">
              <Space>
                <ClockCircleOutlined />
                <span>{formatDate(assignment.due_date)}</span>
              </Space>
            </Descriptions.Item>
            
            {assignment.is_completed && (
              <Descriptions.Item label="제출일">
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }}/>
                  <span>{assignment.submission_date ? formatDate(assignment.submission_date) : '정보 없음'}</span>
                </Space>
              </Descriptions.Item>
            )}
            
            {assignment.is_completed && assignment.score !== undefined && (
              <Descriptions.Item label="점수">
                <Space>
                  <FileDoneOutlined style={{ color: '#1677ff' }}/>
                  <span>{assignment.score}</span>
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
        
        {/* 제출된 내용 */}
        {assignment.is_completed && assignment.submission_data && (
          <Card className="mb-6 shadow-sm" title="제출 내용">
            {assignment.submission_data.content && (
              <div className="mb-4">
                <Paragraph>{assignment.submission_data.content}</Paragraph>
              </div>
            )}
            
            {assignment.submission_data.files && assignment.submission_data.files.length > 0 && (
              <div>
                <Text strong>제출 파일</Text>
                <ul className="mt-2">
                  {assignment.submission_data.files.map((file: SubmissionFile, index: number) => (
                    <li key={index} className="py-1">
                      <Button type="link" icon={<FileTextOutlined />}>
                        {file.name}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}
        
        {/* 피드백 */}
        {assignment.is_completed && assignment.feedback && (
          <Card className="mb-6 shadow-sm" title="피드백">
            <Paragraph>{assignment.feedback}</Paragraph>
          </Card>
        )}
        
        {/* 과제 제출 폼 - 마감되지 않고 아직 제출하지 않은 경우에만 표시 */}
        {!assignment.is_completed && assignment.status !== '마감됨' && (
          <Card className="mb-6 shadow-sm" title="과제 제출">
            <div className="mb-4">
              <Text>내용 작성</Text>
              <TextArea 
                rows={6} 
                placeholder="과제 내용을 작성하세요..." 
                value={submissionText}
                onChange={e => setSubmissionText(e.target.value)}
                className="mt-2"
              />
            </div>
            
            <div className="mb-4">
              <Text>파일 업로드</Text>
              <Dragger {...uploadProps} className="mt-2">
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">클릭하거나 파일을 이 영역으로 드래그하세요</p>
                <p className="ant-upload-hint">
                  여러 파일을 한 번에 업로드할 수 있습니다
                </p>
              </Dragger>
            </div>
            
            <div className="text-right">
              <Button 
                type="primary" 
                disabled={!canSubmit()} 
                onClick={() => setSubmitModalVisible(true)}
              >
                과제 제출
              </Button>
            </div>
          </Card>
        )}
        
        {/* 마감된 경우 */}
        {!assignment.is_completed && assignment.status === '마감됨' && (
          <Card className="mb-6 shadow-sm">
            <Alert
              message="제출 마감"
              description="이 과제는 제출 기한이 지났습니다."
              type="warning"
              showIcon
            />
          </Card>
        )}
        
        {submitModal}
      </div>
    </div>
  );
};

export default AssignmentDetailPage; 