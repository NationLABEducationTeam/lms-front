export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  completionDate: string;
  grade: string;
  status: 'pending' | 'issued';
  certificateUrl?: string;
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  key: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateCertificateParams {
  templateKey: string;
  studentName: string;
  courseId: string;
  enrollmentId: string;
  certificateId?: string;
  fontOptions?: {
    size?: number;
    color?: [number, number, number];  // RGB
    y_offset?: number;  // 세로 위치 조정 (양수: 아래로, 음수: 위로)
  };
}

export interface GenerateCertificateResponse {
  success: boolean;
  message: string;
  data?: {
    certificateId: string;
    certificateUrl: string;
    downloadUrl: string;
    studentName: string;
    courseId: string;
    enrollmentId: string;
  };
}

export interface UploadTemplateResponse {
  success: boolean;
  templateId: string;
  templateUrl: string;
  presignedUrl: string;
} 