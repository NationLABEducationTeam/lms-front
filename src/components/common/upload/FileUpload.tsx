import { FC } from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

interface FileUploadProps {
  userRole: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
}

export const FileUpload: FC<FileUploadProps> = ({ userRole }) => {
  const props = {
    name: 'file',
    multiple: true,
    action: 'https://your-upload-url.com',
    onChange(info: any) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} 파일이 성공적으로 업로드되었습니다.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} 파일 업로드에 실패했습니다.`);
      }
    },
    onDrop(e: any) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <Dragger {...props}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">클릭하거나 파일을 이 영역으로 드래그하세요</p>
      <p className="ant-upload-hint">
        단일 또는 대량의 파일 업로드를 지원합니다.
      </p>
    </Dragger>
  );
}; 