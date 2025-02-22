import { FC, useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { X, BookOpen, MessageSquare, Bookmark, Clock, ArrowLeft, Maximize } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import VideoPlayer from '@/components/video/VideoPlayer';
import { toast } from 'sonner';
import { Button } from '@/components/common/ui/button';
import {
  useCreateTimemarkMutation,
  useGetTimemarksQuery,
  useUpdateTimemarkMutation,
  useDeleteTimemarkMutation,
} from '@/services/api/courseApi';
import { Timemark } from '@/types/course';

interface LocationState {
  videoUrl: string;
  title: string;
  lectureTitle?: string;  // 실제 강의 제목
  weekTitle?: string;     // 주차 제목
}

const VideoPlayerPage: FC = () => {
  const { courseId, weekId, videoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timemarks, setTimemarks] = useState<Timemark[]>([]);
  const [selectedTimemark, setSelectedTimemark] = useState<Timemark | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  // RTK Query hooks
  const [createTimemark] = useCreateTimemarkMutation();
  const [updateTimemark] = useUpdateTimemarkMutation();
  const [deleteTimemark] = useDeleteTimemarkMutation();
  const { data: timemarkData } = useGetTimemarksQuery(
    { courseId: courseId!, videoId: videoId! },
    { skip: !courseId || !videoId }
  );

  const handleBack = () => {
    navigate(-1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 타임마크 생성
  const handleCreateTimemark = useCallback(async () => {
    if (!videoRef.current || !courseId || !videoId) return;

    const currentTime = videoRef.current.currentTime;
    
    // 새로운 임시 타임마크 객체 생성
    const newTimemark: Timemark = {
      id: 'temp-' + Date.now(),
      courseId,
      videoId,
      userId: '',  // API 호출 시 서버에서 설정됨
      timestamp: currentTime,
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSaved: false,
      isEdited: false
    };

    // 메모장 UI 표시
    setSelectedTimemark(newTimemark);
    setIsEditing(true);
    setEditedContent('');
    setActiveTab('notes');
  }, [courseId, videoId]);

  // 타임마크 저장
  const handleSaveTimemark = async () => {
    if (!selectedTimemark || !courseId || !videoId) {
      toast.error('필수 정보가 누락되었습니다.');
      return;
    }

    if (!editedContent.trim()) {
      toast.error('내용을 입력해주세요.');
      return;
    }

    try {
      // 임시 타임마크인 경우 (새로 생성)
      if (selectedTimemark.id.startsWith('temp-')) {
        await createTimemark({
          courseId,
          videoId,
          timestamp: selectedTimemark.timestamp,
          content: editedContent.trim()
        }).unwrap();
        
        toast.success('타임마크가 생성되었습니다.');
      } else {
        // 기존 타임마크 수정
        await updateTimemark({
          timemarkId: selectedTimemark.id,
          timestamp: selectedTimemark.timestamp,
          content: editedContent.trim()
        }).unwrap();
        
        toast.success('타임마크가 수정되었습니다.');
      }

      setIsEditing(false);
      setSelectedTimemark(null);
    } catch (error: any) {
      console.error('Timemark save error:', error);
      toast.error(error.data?.message || '타임마크 저장에 실패했습니다.');
    }
  };

  // 타임마크 삭제
  const handleDeleteTimemark = async (timemarkId: string, timestamp: number) => {
    try {
      // 삭제 전 사용자 확인
      if (!window.confirm('이 타임마크를 삭제하시겠습니까?')) {
        return;
      }

      const response = await deleteTimemark({ 
        timemarkId,
        timestamp
      }).unwrap();

      if (!response.success) {
        throw new Error(response.message || '타임마크 삭제에 실패했습니다.');
      }

      setSelectedTimemark(null);
      toast.success('타임마크가 삭제되었습니다.');
    } catch (error: any) {
      console.error('Timemark delete error:', error);
      toast.error(
        error.data?.message || error.message || '타임마크 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.'
      );
    }
  };

  // 타임마크 클릭
  const handleTimemarkClick = (timemark: Timemark) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timemark.timestamp;
      setSelectedTimemark(timemark);
      setEditedContent(timemark.content);
    }
  };

  // 편집 시작
  const handleStartEditing = (timemark: Timemark) => {
    setSelectedTimemark(timemark);
    setEditedContent(timemark.content);
    setIsEditing(true);
  };

  // 편집 취소
  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditedContent('');
  };

  // 컴포넌트 마운트 시 로컬 스토리지에서 타임마크 불러오기
  useEffect(() => {
    const storageKey = `timemarks_${courseId}_${weekId}_${videoId}`;
    const savedTimemarks = JSON.parse(localStorage.getItem(storageKey) || '[]');
    setTimemarks(savedTimemarks);
  }, [courseId, weekId, videoId]);

  // 시간 포맷팅 함수
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!state?.videoUrl) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">비디오를 찾을 수 없습니다</h1>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* 상단 네비게이션 바 */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/50 to-transparent z-50">
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 flex items-center text-white/90 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">돌아가기</span>
        </button>
      </div>

      {/* 메인 콘텐츠 */}
      <div className={`flex ${isFullscreen ? 'h-screen' : 'min-h-screen pt-16'}`}>
        {/* 좌측: 비디오 플레이어 영역 */}
        <div className={`${isFullscreen ? 'w-full' : 'w-[calc(100%-350px)]'} bg-black relative`}>
          <div className="w-full h-full flex items-center justify-center">
            <VideoPlayer 
              ref={videoRef} 
              src={state.videoUrl} 
              title={state.title}
            />
          </div>
        </div>

        {/* 우측: 기능 패널 */}
        {!isFullscreen && (
          <div className="w-[350px] bg-white h-screen overflow-y-auto flex flex-col">
            {/* 헤더 */}
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-lg font-semibold text-gray-900">
                {state.lectureTitle || '강의 영상'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {weekId}주차 - {state.weekTitle || '강의'}
              </p>
            </div>

            {/* 탭 네비게이션 */}
            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
              <Tabs.List className="flex border-b border-gray-200">
                <Tabs.Trigger
                  value="overview"
                  className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors
                    ${activeTab === 'overview' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <BookOpen className="w-4 h-4 mx-auto mb-1" />
                  개요
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="notes"
                  className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors
                    ${activeTab === 'notes' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <MessageSquare className="w-4 h-4 mx-auto mb-1" />
                  노트
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="bookmarks"
                  className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors
                    ${activeTab === 'bookmarks' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Bookmark className="w-4 h-4 mx-auto mb-1" />
                  북마크
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="history"
                  className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors
                    ${activeTab === 'history' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Clock className="w-4 h-4 mx-auto mb-1" />
                  기록
                </Tabs.Trigger>
              </Tabs.List>

              {/* 탭 컨텐츠 */}
              <div className="flex-1 overflow-y-auto">
                <Tabs.Content value="overview" className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">강의 정보</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        이 강의는 [강의 주제]에 대해 다룹니다.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">학습 목표</h3>
                      <ul className="mt-1 text-sm text-gray-500 list-disc list-inside">
                        <li>학습 목표 1</li>
                        <li>학습 목표 2</li>
                        <li>학습 목표 3</li>
                      </ul>
                    </div>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="notes" className="p-4">
                  <div className="space-y-4">
                    {selectedTimemark ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">
                              {formatTime(selectedTimemark.timestamp)}
                            </span>
                            {!selectedTimemark.isSaved && (
                              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                저장되지 않음
                              </span>
                            )}
                            {selectedTimemark.isEdited && (
                              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                수정됨
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTimemark(selectedTimemark.id, selectedTimemark.timestamp)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              삭제
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedTimemark(null)}
                              className="text-gray-600"
                            >
                              닫기
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <textarea
                            value={isEditing ? editedContent : selectedTimemark.content}
                            onChange={(e) => setEditedContent(e.target.value)}
                            placeholder="이 시점에 대한 노트를 작성하세요..."
                            disabled={!isEditing}
                            className="w-full h-[150px] p-3 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-700"
                          />
                          <div className="flex justify-end gap-2">
                            {isEditing ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCancelEditing}
                                >
                                  취소
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={handleSaveTimemark}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  저장
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setIsEditing(true);
                                  setEditedContent(selectedTimemark.content);
                                }}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                수정
                              </Button>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium text-gray-900">타임마크 목록</h3>
                          <button
                            onClick={handleCreateTimemark}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                          >
                            <Clock className="w-4 h-4" />
                            타임마크 생성
                          </button>
                        </div>
                        {timemarkData?.data.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
                            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">아직 생성된 타임마크가 없습니다.</p>
                            <p className="text-xs text-gray-400 mt-1">
                              중요한 부분에서 타임마크를 생성하고 노트를 작성해보세요.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {timemarkData?.data.map((timemark: Timemark) => (
                              <button
                                key={timemark.id}
                                onClick={() => handleTimemarkClick(timemark)}
                                className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left group"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-600">
                                      {formatTime(timemark.timestamp)}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(timemark.createdAt).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-gray-900">
                                  {timemark.content || '(내용 없음)'}
                                </p>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Tabs.Content>

                <Tabs.Content value="bookmarks" className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-gray-900">00:15:30</div>
                        <div className="text-sm text-gray-500">중요한 개념 설명 부분</div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-500">
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="history" className="p-4">
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-900">최근 시청 기록</div>
                      <div className="mt-1 text-sm text-gray-500">마지막 시청: 00:25:10</div>
                    </div>
                  </div>
                </Tabs.Content>
              </div>
            </Tabs.Root>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayerPage; 