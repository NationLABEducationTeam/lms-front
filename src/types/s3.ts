export interface S3Structure {
  type: 'directory' | 'file';
  name: string;
  path: string;
  folders?: S3Structure[];
  files?: S3Structure[];
} 