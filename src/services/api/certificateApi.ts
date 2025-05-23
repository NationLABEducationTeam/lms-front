import { createApi } from '@reduxjs/toolkit/query/react';
import { Certificate, CertificateTemplate, GenerateCertificateParams, GenerateCertificateResponse, UploadTemplateResponse } from '@/types/certificate';

// Lambda URL - 이것만 직접 호출
const CERTIFICATE_GENERATOR_URL = 'https://bgg24ygzxos3ksvuh7yh6vjtsq0xbbsc.lambda-url.ap-northeast-2.on.aws/'; 
const CERTIFICATE_BUCKET = 'nationslablmscertificates';
const TEMPLATE_PREFIX = 'certificate-templates/';
const OUTPUT_PREFIX = 'certificates/';

// S3 직접 접근 API
export const certificateApi = createApi({
  reducerPath: 'certificateApi',
  baseQuery: async (args) => {
    console.log('S3 직접 접근 API 호출:', args);
    return { data: null };
  },
  tagTypes: ['Certificate', 'CertificateTemplate'],
  endpoints: (builder) => ({
    // 발급된 모든 수료증 목록 조회 (더미 데이터)
    getCertificates: builder.query<Certificate[], void>({
      queryFn: async () => {
        const dummyData: Certificate[] = [
          {
            id: "1",
            studentId: "student-1",
            studentName: '김철수',
            courseId: "course-1",
            courseName: 'AWS 클라우드 아키텍처',
            completionDate: '2024-03-15',
            grade: 'A',
            status: 'issued',
            createdAt: '2024-03-15T00:00:00Z',
            updatedAt: '2024-03-15T00:00:00Z',
          },
          {
            id: "2",
            studentId: "student-2", 
            studentName: '이영희',
            courseId: "course-2",
            courseName: 'DevOps 마스터 과정',
            completionDate: '2024-03-14',
            grade: 'A+',
            status: 'pending',
            createdAt: '2024-03-14T00:00:00Z',
            updatedAt: '2024-03-14T00:00:00Z',
          },
          {
            id: "3",
            studentId: "student-3",
            studentName: '박지민',
            courseId: "course-3",
            courseName: '자바스크립트 프로그래밍',
            completionDate: '2024-03-10',
            grade: 'B+',
            status: 'issued',
            createdAt: '2024-03-10T00:00:00Z',
            updatedAt: '2024-03-10T00:00:00Z',
          },
        ];
        
        return { data: dummyData };
      },
      providesTags: ['Certificate'],
    }),
    
    // 인증서 템플릿 목록 조회 (더미 데이터)
    getCertificateTemplates: builder.query<CertificateTemplate[], void>({
      queryFn: async () => {
        // 빈 템플릿 배열 반환 (S3에서 실제로 가져올 때까지)
        const dummyTemplates: CertificateTemplate[] = [];
        
        return { data: dummyTemplates };
      },
      providesTags: ['CertificateTemplate'],
    }),
    
    // 인증서 템플릿 업로드를 위한 presigned URL 요청
    getTemplateUploadUrl: builder.mutation<UploadTemplateResponse, { name: string; description?: string; type: string; size: number }>({
      queryFn: async (templateInfo) => {
        const templateKey = `${TEMPLATE_PREFIX}${templateInfo.name.replace(/\s+/g, '-').toLowerCase()}.png`;
        
        // S3 presigned URL (실제로는 AWS SDK나 Lambda를 통해 발급해야 함)
        const fakeResponse: UploadTemplateResponse = {
          success: true,
          templateId: Math.random().toString(36).substring(2, 15),
          templateUrl: `https://${CERTIFICATE_BUCKET}.s3.amazonaws.com/${templateKey}`,
          presignedUrl: `https://${CERTIFICATE_BUCKET}.s3.amazonaws.com/${templateKey}?AWSAccessKeyId=FAKE&Signature=FAKE&Expires=9999999999`,
        };
        
        return { data: fakeResponse };
      },
      invalidatesTags: ['CertificateTemplate'],
    }),
    
    // 인증서 생성 요청 - 람다 직접 호출
    generateCertificate: builder.mutation<GenerateCertificateResponse, GenerateCertificateParams>({
      queryFn: async (params) => {
        try {
          // 람다 함수 직접 호출
          const response = await fetch(CERTIFICATE_GENERATOR_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            return { error: { status: response.status, data } };
          }
          
          return { data: data as GenerateCertificateResponse };
        } catch (error) {
          console.error('인증서 생성 중 오류 발생:', error);
          return { 
            error: { 
              status: 500, 
              data: { message: '인증서 생성 요청 처리 중 오류가 발생했습니다.' } 
            } 
          };
        }
      },
      invalidatesTags: ['Certificate'],
    }),
  }),
});

export const {
  useGetCertificatesQuery,
  useGetCertificateTemplatesQuery,
  useGetTemplateUploadUrlMutation,
  useGenerateCertificateMutation,
} = certificateApi; 