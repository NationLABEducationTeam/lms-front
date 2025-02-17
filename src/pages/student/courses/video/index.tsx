import { FC, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { X, BookOpen, MessageSquare, Bookmark, Clock, ArrowLeft, Maximize } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import VideoPlayer from '@/components/video/VideoPlayer';

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
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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
            <VideoPlayer src={state.videoUrl} title={state.title} />
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
                    <textarea
                      placeholder="강의를 들으면서 노트를 작성해보세요..."
                      className="w-full h-[200px] p-3 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex justify-end">
                      <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        저장하기
                      </button>
                    </div>
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