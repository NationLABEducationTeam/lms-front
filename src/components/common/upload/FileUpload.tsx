import { FC, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
}

export const FileUpload: FC<FileUploadProps> = ({
  onUpload,
  accept,
  multiple,
  maxFiles = 1,
  className
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (maxFiles && files.length > maxFiles) {
        setError(`최대 ${maxFiles}개의 파일만 선택할 수 있습니다.`);
        return;
      }
      setError(null);
      onUpload(Array.from(files));
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        className="hidden"
        accept={accept}
        multiple={multiple || maxFiles > 1}
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        className="bg-white/10 hover:bg-white/20"
      >
        파일 선택
      </Button>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}; 