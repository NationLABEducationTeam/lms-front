import { FC, useEffect } from 'react';
import { toast } from 'sonner';

interface FileDownloaderProps {
  fileName: string;
  downloadUrl: string;
  onComplete: () => void;
}

const FileDownloader: FC<FileDownloaderProps> = ({ fileName, downloadUrl, onComplete }) => {
  useEffect(() => {
    const downloadFile = () => {
      try {
        console.log('파일 다운로드 시작:', fileName);
        window.location.href = downloadUrl;
        toast.success('파일 다운로드가 시작되었습니다.');
        onComplete();
      } catch (error) {
        console.error('파일 다운로드 중 오류 발생:', error);
        toast.error('파일 다운로드에 실패했습니다.');
        onComplete();
      }
    };

    downloadFile();
  }, [fileName, downloadUrl, onComplete]);

  return null;
};

export default FileDownloader; 