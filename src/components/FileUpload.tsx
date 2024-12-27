import React, { useState } from 'react';
import { uploadData } from 'aws-amplify/storage';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AlertCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "./ui/alert";

interface FileUploadProps {
  userRole: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ userRole }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('파일을 선택해주세요.');
      return;
    }

    if (userRole === 'STUDENT') {
      setError('학생은 파일을 업로드할 수 없습니다.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess(false);

      // Get the current session to ensure we have credentials
      const session = await fetchAuthSession();
      if (!session.credentials) {
        throw new Error('인증 정보를 가져올 수 없습니다.');
      }

      const result = await uploadData({
        key: `${userRole.toLowerCase()}/${file.name}`,
        data: file,
        options: {
          contentType: file.type,
          accessLevel: 'private'
        }
      }).result;

      console.log('Upload success:', result);
      setSuccess(true);
      setFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      setError('파일 업로드에 실패했습니다. 다시 로그인해주세요.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          type="file"
          onChange={handleFileChange}
          className="flex-1"
          disabled={uploading}
        />
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-gradient-to-r from-[#65e892] to-[#3994d6] hover:from-[#3994d6] hover:to-[#354abf] text-white"
        >
          {uploading ? '업로드 중...' : '업로드'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
          <AlertTitle>성공</AlertTitle>
          <AlertDescription>파일이 성공적으로 업로드되었습니다.</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FileUpload; 