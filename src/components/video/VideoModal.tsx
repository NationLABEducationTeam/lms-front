import { FC } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

const VideoModal: FC<VideoModalProps> = ({ isOpen, onClose, videoUrl, title }) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 transition-opacity duration-300"
        />
        <Dialog.Content 
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-[1600px] max-h-[90vh] bg-black rounded-xl shadow-2xl z-50 overflow-hidden"
        >
          <Dialog.Title className="sr-only">
            {title || '동영상 플레이어'}
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            동영상을 시청할 수 있는 플레이어가 제공됩니다.
          </Dialog.Description>
          
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-50"
              aria-label="닫기"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <VideoPlayer src={videoUrl} title={title} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default VideoModal; 