import { toast } from 'sonner';

interface DownloadOptions {
  fileName?: string;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
  onProgress?: (progress: number) => void;
}

/**
 * 파일 다운로드 유틸리티 함수
 * @param url 다운로드할 파일의 URL
 * @param options 다운로드 옵션
 */
export async function downloadFile(url: string, options: DownloadOptions = {}) {
  const { fileName, onError, onSuccess, onProgress } = options;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`다운로드 실패: ${response.statusText}`);
    }
    
    // Content-Length 헤더로 파일 크기 확인
    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    
    // 프로그레스 트래킹을 위한 리더 설정
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('스트림을 읽을 수 없습니다.');
    }
    
    let receivedLength = 0;
    const chunks: Uint8Array[] = [];
    
    // 스트림 읽기
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedLength += value.length;
      
      // 진행률 콜백 호출
      if (total > 0 && onProgress) {
        const progress = (receivedLength / total) * 100;
        onProgress(progress);
      }
    }
    
    // Blob 생성
    const blob = new Blob(chunks);
    const blobUrl = window.URL.createObjectURL(blob);
    
    // 다운로드 링크 생성 및 클릭
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName ? decodeURIComponent(fileName) : getFileNameFromUrl(url);
    
    document.body.appendChild(link);
    link.click();
    
    // 정리 작업
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(link);
    }, 100);
    
    onSuccess?.();
    toast.success('파일 다운로드가 완료되었습니다.');
    
  } catch (error) {
    console.error('파일 다운로드 오류:', error);
    
    const errorMessage = error instanceof Error ? error.message : '파일 다운로드에 실패했습니다.';
    toast.error(errorMessage);
    onError?.(error as Error);
    
    // 폴백: 새 탭에서 열기 시도
    try {
      window.open(url, '_blank');
    } catch (e) {
      console.error('새 탭에서 열기 실패:', e);
    }
  }
}

/**
 * 여러 파일을 순차적으로 다운로드
 * @param files 다운로드할 파일 정보 배열
 */
export async function downloadMultipleFiles(
  files: Array<{ url: string; fileName?: string }>,
  options?: {
    onAllComplete?: () => void;
    onEachComplete?: (index: number) => void;
    delay?: number;
  }
) {
  const { onAllComplete, onEachComplete, delay = 500 } = options || {};
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    await downloadFile(file.url, { 
      fileName: file.fileName,
      onSuccess: () => onEachComplete?.(i)
    });
    
    // 마지막 파일이 아닌 경우 지연 추가
    if (i < files.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  onAllComplete?.();
}

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 * @param bytes 바이트 크기
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * URL에서 파일명 추출
 * @param url 파일 URL
 */
export function getFileNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split('/').pop() || 'download';
    return decodeURIComponent(fileName);
  } catch {
    return 'download';
  }
}

/**
 * 파일 확장자 추출
 * @param fileName 파일명
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

/**
 * MIME 타입으로 파일 유형 판별
 * @param mimeType MIME 타입
 */
export function getFileTypeFromMime(mimeType: string): string {
  const typeMap: { [key: string]: string } = {
    'application/pdf': 'PDF',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'application/vnd.ms-excel': 'Excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
    'application/vnd.ms-powerpoint': 'PowerPoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
    'image/jpeg': 'Image',
    'image/png': 'Image',
    'image/gif': 'Image',
    'video/mp4': 'Video',
    'video/mpeg': 'Video',
    'audio/mpeg': 'Audio',
    'audio/wav': 'Audio',
    'text/plain': 'Text',
    'application/zip': 'Archive',
    'application/x-rar-compressed': 'Archive',
  };
  
  for (const [mime, type] of Object.entries(typeMap)) {
    if (mimeType.startsWith(mime)) {
      return type;
    }
  }
  
  return 'File';
} 