export interface S3Structure {
  type: 'directory' | 'file';
  name: string;
  path: string;
  lastModified?: string;
} 