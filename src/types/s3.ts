export interface S3Structure {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: string;
  parent?: string;
}

export interface S3UploadResponse {
  url: string;
  key: string;
} 