import { FC, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { X, BookOpen, MessageSquare, Bookmark, Clock } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

const VideoModal: FC<VideoModalProps> = ({ isOpen, onClose, videoUrl, title }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 transition-opacity duration-300"
        />
        <Dialog.Content 
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95vw] h-[90vh] max-w-[1800px] bg-white rounded-xl shadow-2xl z-50 overflow-hidden flex"
        >
          {/* 좌측: 비디오 플레이어 영역 */}
          <div className="flex-1 bg-black relative">
            <VideoPlayer src={videoUrl} title={title} />
          </div>

          {/* 우측: 기능 패널 */}
          <div className="w-[350px] border-l border-gray-200 flex flex-col bg-white">
            {/* 헤더 */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {title || '강의 영상'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="닫기"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default VideoModal; 