import { FC, useRef } from 'react';
import { Button } from '../ui/button';

interface FileUploadProps {
  onUpload: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
}

export const FileUpload: FC<FileUploadProps> = ({ onUpload, accept, multiple }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files);
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        className="hidden"
        accept={accept}
        multiple={multiple}
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        className="bg-white/10 hover:bg-white/20"
      >
        파일 선택
      </Button>
    </div>
  );
}; 