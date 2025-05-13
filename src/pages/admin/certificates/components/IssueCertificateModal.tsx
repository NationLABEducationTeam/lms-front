import { FC, useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/common/ui/dialog";


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { CertificateTemplate } from '@/types/certificate';
import { useGetCertificateTemplatesQuery, useGenerateCertificateMutation } from '@/services/api/certificateApi';
import { toast } from 'sonner';

interface IssueCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  courseId: string;
  courseName: string;
  enrollmentId: string;
  templateKey?: string;
}

const IssueCertificateModal: FC<IssueCertificateModalProps> = ({
  isOpen,
  onClose,
  studentName,
  courseId,
  courseName,
  enrollmentId,
  templateKey: initialTemplateKey
}) => {
  // 상태 관리
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string | undefined>(initialTemplateKey);
  const [fontSize, setFontSize] = useState<number>(60);
  const [yOffset, setYOffset] = useState<number>(0);
  
  // 템플릿 목록 조회 - 실제 API 연동
  const { data: templates, isLoading: templatesLoading } = useGetCertificateTemplatesQuery();
  
  // 실제 템플릿 데이터가 없을 경우 임시 데이터 사용
  const templatesData = templates || [
    {
      id: "1",
      name: "기본 템플릿",
      description: "기본 수료증 템플릿입니다.",
      imageUrl: "https://via.placeholder.com/800x600?text=Certificate+Template+1",
      key: "certificate-templates/default.png",
      createdAt: "2024-03-01T00:00:00Z",
      updatedAt: "2024-03-01T00:00:00Z",
    },
    {
      id: "2",
      name: "고급 템플릿",
      description: "고급 수료증 템플릿입니다.",
      imageUrl: "https://via.placeholder.com/800x600?text=Certificate+Template+2", 
      key: "certificate-templates/premium.png",
      createdAt: "2024-03-02T00:00:00Z",
      updatedAt: "2024-03-02T00:00:00Z",
    }
  ];
  
  // 수료증 생성 mutation 훅
  const [generateCertificate, { isLoading: isGenerating }] = useGenerateCertificateMutation();
  
  // 발급 처리
  const handleIssueCertificate = async () => {
    if (!selectedTemplateKey) {
      toast.error('템플릿을 선택해주세요.');
      return;
    }
    
    try {
      console.log('수료증 발급 요청:', {
        templateKey: selectedTemplateKey,
        studentName,
        courseId,
        enrollmentId,
        fontOptions: {
          size: fontSize,
          color: [0, 0, 0],
          y_offset: yOffset
        }
      });
      
      const result = await generateCertificate({
        templateKey: selectedTemplateKey,
        studentName,
        courseId,
        enrollmentId,
        fontOptions: {
          size: fontSize,
          color: [0, 0, 0], // 검은색 (RGB)
          y_offset: yOffset
        }
      }).unwrap();
      
      console.log('수료증 발급 결과:', result);
      
      if (result.success) {
        toast.success('수료증이 성공적으로 발급되었습니다.');
        onClose();
        
        // 생성된 수료증 다운로드 URL이 있다면 새 창에서 열기
        if (result.data?.downloadUrl) {
          window.open(result.data.downloadUrl, '_blank');
        }
      } else {
        toast.error(result.message || '수료증 발급에 실패했습니다.');
      }
    } catch (error) {
      console.error('수료증 발급 실패:', error);
      toast.error('수료증 발급 중 오류가 발생했습니다.');
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">수료증 발급</DialogTitle>
          <DialogDescription className="text-gray-500">
            {studentName} 학생의 {courseName} 강의 수료증을 발급합니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* 템플릿 선택 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">템플릿 선택</h4>
            <Select
              value={selectedTemplateKey}
              onValueChange={setSelectedTemplateKey}
              disabled={templatesLoading || isGenerating}
            >
              <SelectTrigger className="w-full bg-white text-gray-900">
                <SelectValue placeholder="템플릿을 선택하세요" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {templatesLoading ? (
                  <div className="flex items-center justify-center p-2 text-gray-900">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>템플릿 로딩 중...</span>
                  </div>
                ) : (
                  templatesData.map((template) => (
                    <SelectItem key={template.id} value={template.key} className="text-gray-900">
                      {template.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* 선택된 템플릿 미리보기 */}
          {selectedTemplateKey && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">템플릿 미리보기</h4>
              <div className="border rounded-md overflow-hidden">
                <img 
                  src={templatesData.find(t => t.key === selectedTemplateKey)?.imageUrl || ''} 
                  alt="템플릿 미리보기" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}
          
          {/* 폰트 설정 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">텍스트 설정</h4>
            <div className="space-y-2">
              <label className="text-xs text-gray-700 flex justify-between">
                <span>폰트 크기: {fontSize}px</span>
              </label>
              <input 
                type="range" 
                min="30" 
                max="100" 
                value={fontSize} 
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
                disabled={isGenerating}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-gray-700 flex justify-between">
                <span>세로 위치 조정: {yOffset > 0 ? `+${yOffset}` : yOffset}px</span>
              </label>
              <input 
                type="range" 
                min="-100" 
                max="100" 
                value={yOffset} 
                onChange={(e) => setYOffset(Number(e.target.value))}
                className="w-full"
                disabled={isGenerating}
              />
              <p className="text-xs text-gray-600">
                양수: 아래로 이동, 음수: 위로 이동
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isGenerating}
            className="text-gray-900 bg-white"
          >
            취소
          </Button>
          <Button
            onClick={handleIssueCertificate}
            disabled={!selectedTemplateKey || isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                발급 중...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                발급하기
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IssueCertificateModal; 