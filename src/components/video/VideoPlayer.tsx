import { FC, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  Settings, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize,
  Forward,
  Rewind,
  SkipForward,
  SkipBack
} from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  title?: string;
}

interface QualityLevel {
  height: number;
  bitrate: number;
  id: number;
  label: string;
}

const VideoPlayer: FC<VideoPlayerProps> = ({ src, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // 컨트롤 표시 타이머 관리
  const resetControlsTimer = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (!showQualityMenu) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // HLS 지원 확인
    if (!Hls.isSupported()) {
      console.error('HLS is not supported in this browser.');
      return;
    }

    // HLS 인스턴스 생성
    const hls = new Hls({
      debug: false,
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hlsRef.current = hls;

    // 비디오 소스 로드
    hls.loadSource(src);
    hls.attachMedia(video);

    // 매니페스트 파싱 완료 이벤트
    hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
      const levels = data.levels.map((level, index) => ({
        height: level.height,
        bitrate: level.bitrate,
        id: index,
        label: `${level.height}p`
      }));
      
      setQualities(levels);
      const highestQuality = levels.length - 1;
      setCurrentQuality(highestQuality);
      hls.currentLevel = highestQuality;
    });

    // 에러 핸들링
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error('Network error:', data);
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error('Media error:', data);
            hls.recoverMediaError();
            break;
          default:
            console.error('Fatal error:', data);
            hls.destroy();
            break;
        }
      }
    });

    // 비디오 이벤트 리스너
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));
    video.addEventListener('timeupdate', () => setCurrentTime(video.currentTime));
    video.addEventListener('loadedmetadata', () => setDuration(video.duration));
    video.addEventListener('volumechange', () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    });
    video.addEventListener('ratechange', () => setPlaybackRate(video.playbackRate));

    // 마우스 이동 감지
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', resetControlsTimer);
      container.addEventListener('mouseleave', () => setShowControls(false));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (container) {
        container.removeEventListener('mousemove', resetControlsTimer);
        container.removeEventListener('mouseleave', () => setShowControls(false));
      }
    };
  }, [src]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleQualityChange = (qualityId: number) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = qualityId;
    setCurrentQuality(qualityId);
    setShowQualityMenu(false);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    videoRef.current.muted = newVolume === 0;
  };

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
  };

  return (
    <div className="video-container relative bg-black rounded-lg overflow-hidden" ref={containerRef}>
      {title && (
        <h2 className="text-xl font-semibold text-white px-4 py-2 absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
          {title}
        </h2>
      )}
      <div className="relative aspect-video group">
        <video
          ref={videoRef}
          className="w-full h-full"
          playsInline
          onClick={togglePlay}
        />
        
        {/* 오버레이 컨트롤 */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          {/* 중앙 재생/일시정지 버튼 */}
          <button
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-4 backdrop-blur-sm"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white" />
            )}
          </button>

          {/* 하단 컨트롤 바 */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-black/80 flex flex-col gap-2">
            {/* 타임라인 */}
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleTimelineChange}
                className="flex-1 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
              <span>{formatTime(duration)}</span>
            </div>

            {/* 컨트롤 버튼들 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button onClick={togglePlay} className="text-white hover:text-white/80">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button onClick={() => skipTime(-10)} className="text-white hover:text-white/80">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button onClick={() => skipTime(10)} className="text-white hover:text-white/80">
                  <SkipForward className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 group relative">
                  <button onClick={toggleMute} className="text-white hover:text-white/80">
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                </div>
              </div>

              <div className="flex-1" />

              {/* 우측 컨트롤 */}
              <div className="flex items-center gap-4">
                {/* 재생 속도 */}
                <div className="relative">
                  <button
                    onClick={() => setShowQualityMenu(false)}
                    className="text-white hover:text-white/80 text-sm px-2 py-1 rounded bg-white/10"
                  >
                    {playbackRate}x
                  </button>
                  <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-md overflow-hidden">
                    {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => handlePlaybackRateChange(rate)}
                        className={`block w-full px-4 py-2 text-sm text-left hover:bg-white/10 ${
                          playbackRate === rate ? 'text-blue-400' : 'text-white'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* 품질 설정 */}
                <div className="relative">
                  <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="text-white hover:text-white/80"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  {showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-md overflow-hidden">
                      <button
                        onClick={() => handleQualityChange(-1)}
                        className={`block w-full px-4 py-2 text-sm text-left hover:bg-white/10 ${
                          currentQuality === -1 ? 'text-blue-400' : 'text-white'
                        }`}
                      >
                        자동
                      </button>
                      {qualities.map((quality) => (
                        <button
                          key={quality.id}
                          onClick={() => handleQualityChange(quality.id)}
                          className={`block w-full px-4 py-2 text-sm text-left hover:bg-white/10 ${
                            currentQuality === quality.id ? 'text-blue-400' : 'text-white'
                          }`}
                        >
                          {quality.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 전체화면 */}
                <button onClick={toggleFullscreen} className="text-white hover:text-white/80">
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer; 