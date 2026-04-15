/* ==========================================================
   VideoPlayer — Obsidian Minimal M3U Player
   HLS/RTMP/Direct stream player with custom controls
   ========================================================== */

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Channel } from '@/lib/m3u-parser';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Loader2, AlertCircle, Tv2, SkipForward
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface VideoPlayerProps {
  channel: Channel | null;
  onNext?: () => void;
}

export default function VideoPlayer({ channel, onNext }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLive, setIsLive] = useState(false);

  const resetControls = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  // Load stream
  useEffect(() => {
    if (!channel || !videoRef.current) return;

    const video = videoRef.current;
    setError(null);
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    // Destroy previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const url = channel.url;
    const isHLS = url.includes('.m3u8') || url.includes('.m3u') || url.includes('hls');

    if (isHLS && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        setIsLive(hls.levels.length > 0);
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError('فشل تحميل البث. يرجى المحاولة مرة أخرى.');
          setIsLoading(false);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS (Safari)
      video.src = url;
      video.play().catch(() => {});
      setIsLoading(false);
      setIsLive(true);
    } else {
      // Direct stream
      video.src = url;
      video.play().catch(() => {});
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => {
      setDuration(video.duration);
      setIsLive(!isFinite(video.duration));
    };
    const onError = () => {
      setError('خطأ في تشغيل البث');
      setIsLoading(false);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('error', onError);
    };
  }, []);

  // Volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) video.pause();
    else video.play().catch(() => {});
  };

  const toggleMute = () => setIsMuted(prev => !prev);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (s: number) => {
    if (!isFinite(s)) return '--:--';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!channel) {
    return (
      <div className="relative w-full aspect-video bg-[#0a0a0f] rounded-xl overflow-hidden flex flex-col items-center justify-center gap-4 border border-white/5">
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663557082629/PLrrf7EdHcKwZ5bUqaPQKn/hero-bg-EaXFpnJ6oDpc8bq53EQYaf.webp)`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663557082629/PLrrf7EdHcKwZ5bUqaPQKn/empty-state-QEbSJ6wB8nhxpKgMBPAERy.webp"
            alt="اختر قناة"
            className="w-24 h-24 object-contain opacity-70"
          />
          <p className="text-white/50 text-sm font-medium">اختر قناة للبدء</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group"
      onMouseMove={resetControls}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        autoPlay
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
            <span className="text-white/70 text-sm">جارٍ التحميل...</span>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-white/80 text-sm">{error}</p>
            <button
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-sm rounded-lg transition-colors"
              onClick={(e) => { e.stopPropagation(); setError(null); if (channel) { const v = videoRef.current; if (v) { v.load(); v.play().catch(() => {}); } } }}
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {/* Channel info top bar */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-20 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          {channel.logo ? (
            <img src={channel.logo} alt={channel.name} className="w-8 h-8 object-contain rounded" onError={e => (e.currentTarget.style.display = 'none')} />
          ) : (
            <Tv2 className="w-5 h-5 text-amber-400" />
          )}
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{channel.name}</p>
            {channel.group && <p className="text-white/50 text-xs">{channel.group}</p>}
          </div>
          {isLive && (
            <div className="mr-auto flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full live-dot" />
              <span className="text-red-300 text-xs font-medium">مباشر</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls bottom bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 player-controls p-4 z-20 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Progress bar (for VOD) */}
        {!isLive && duration > 0 && (
          <div className="mb-3">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={([v]) => {
                if (videoRef.current) videoRef.current.currentTime = v;
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/50 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-amber-500/30 transition-colors"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
          </button>

          {/* Next */}
          {onNext && (
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              onClick={onNext}
            >
              <SkipForward className="w-4 h-4 text-white/70" />
            </button>
          )}

          {/* Volume */}
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              onClick={toggleMute}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-white/70" />
              ) : (
                <Volume2 className="w-4 h-4 text-white/70" />
              )}
            </button>
            <div className="w-20 hidden sm:block">
              <Slider
                value={[isMuted ? 0 : volume]}
                max={100}
                step={1}
                onValueChange={([v]) => { setVolume(v); setIsMuted(v === 0); }}
              />
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Fullscreen */}
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 text-white/70" />
            ) : (
              <Maximize className="w-4 h-4 text-white/70" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
