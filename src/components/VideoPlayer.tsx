import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Settings,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  List,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

interface Episode {
  season: number;
  episode: number;
  title: string;
  video_url: string;
  video_file_path?: string;
  video_file_name?: string;
  use_file_instead_of_url?: boolean;
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  useFileInstead?: boolean;
  fileName?: string;
  episodes?: Episode[];
  currentEpisode?: { season: number; episode: number };
  onEpisodeChange?: (season: number, episode: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  poster, 
  title,
  useFileInstead = false,
  fileName,
  episodes = [],
  currentEpisode,
  onEpisodeChange
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualVideoSrc, setActualVideoSrc] = useState<string>('');
  
  // Advanced features
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isBlurred, setIsBlurred] = useState(false);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  
  // Touch and interaction states
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [lastTap, setLastTap] = useState(0);
  const [isLandscape, setIsLandscape] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [customFullscreen, setCustomFullscreen] = useState(false);

  // Speed options
  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Detect orientation
  useEffect(() => {
    const handleOrientationChange = () => {
      setTimeout(() => {
        setIsLandscape(window.innerWidth > window.innerHeight);
      }, 100);
    };

    handleOrientationChange();
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  // Helper function to add .mp4 extension if missing
  const ensureMp4Extension = (filePath: string): string => {
    if (!filePath) return filePath;
    
    const hasExtension = /\.[a-zA-Z0-9]+$/.test(filePath);
    
    if (!hasExtension) {
      return `${filePath}.mp4`;
    }
    
    return filePath;
  };

  // Get current episode for series
  const getCurrentEpisodeData = (): Episode | null => {
    if (!currentEpisode || !episodes.length) return null;
    
    return episodes.find(ep => 
      ep.season === currentEpisode.season && ep.episode === currentEpisode.episode
    ) || null;
  };

  // Smart video source resolution
  useEffect(() => {
    const resolveVideoSource = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const currentEpisodeData = getCurrentEpisodeData();
        const shouldUseFile = useFileInstead || (currentEpisodeData?.use_file_instead_of_url);
        const targetFileName = currentEpisodeData?.video_file_name || fileName;
        const fallbackSrc = currentEpisodeData?.video_url || src;
        
        if (shouldUseFile && targetFileName) {
          const correctedFileName = ensureMp4Extension(targetFileName);
          const filePathInStorage = `movies/${correctedFileName}`;
          
          const { data: publicUrlData } = supabase.storage
            .from('movies')
            .getPublicUrl(filePathInStorage);
          
          if (publicUrlData?.publicUrl) {
            setActualVideoSrc(publicUrlData.publicUrl);
          } else {
            throw new Error('فشل في الحصول على رابط الملف المحلي');
          }
        } else {
          if (fallbackSrc) {
            const correctedSrc = ensureMp4Extension(fallbackSrc);
            setActualVideoSrc(correctedSrc);
          } else {
            throw new Error('لا يوجد مصدر فيديو متاح');
          }
        }
      } catch (err) {
        console.error('خطأ في تحديد مصدر الفيديو:', err);
        const errorMessage = err instanceof Error ? err.message : 'خطأ في تحميل الفيديو';
        setError(errorMessage);
        
        const currentEpisodeData = getCurrentEpisodeData();
        const fallbackSrc = currentEpisodeData?.video_url || src;
        if (fallbackSrc) {
          const correctedSrc = ensureMp4Extension(fallbackSrc);
          setActualVideoSrc(correctedSrc);
          setError(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    resolveVideoSource();
  }, [src, useFileInstead, fileName, episodes, currentEpisode]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !actualVideoSrc) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setCanPlay(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (episodes.length > 0 && currentEpisode && onEpisodeChange) {
        const currentIndex = episodes.findIndex(ep => 
          ep.season === currentEpisode.season && ep.episode === currentEpisode.episode
        );
        if (currentIndex >= 0 && currentIndex < episodes.length - 1) {
          const nextEpisode = episodes[currentIndex + 1];
          onEpisodeChange(nextEpisode.season, nextEpisode.episode);
        }
      }
    };

    const handleError = (e: any) => {
      console.error('خطأ في تشغيل الفيديو:', e);
      setError('خطأ في تحميل أو تشغيل الفيديو');
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setIsBuffering(false);
      setCanPlay(true);
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handleCanPlayThrough = () => {
      setIsBuffering(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setIsBuffering(false);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('progress', handleProgress);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('progress', handleProgress);
    };
  }, [actualVideoSrc, episodes, currentEpisode, onEpisodeChange]);

  // Enhanced controls visibility management
  const showControlsWithTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    if (isPlaying && !showSettings && !showEpisodeList) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      setControlsTimeout(timeout);
    }
  }, [isPlaying, showSettings, showEpisodeList, controlsTimeout]);

  // Toggle play/pause function
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !actualVideoSrc || !canPlay) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('خطأ في تشغيل الفيديو:', err);
        setError('فشل في تشغيل الفيديو');
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [actualVideoSrc, canPlay]);

  // Skip forward/backward functions
  const skipForward = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.currentTime + 10, video.duration);
  }, []);

  const skipBackward = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(video.currentTime - 10, 0);
  }, []);

  // Enhanced keyboard controls with Arabic support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          showControlsWithTimeout();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          showControlsWithTimeout();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          showControlsWithTimeout();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
        case 'ة': // Arabic equivalent of M
          e.preventDefault();
          toggleMute();
          showControlsWithTimeout();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skipForward, skipBackward, showControlsWithTimeout]);

  // Enhanced touch/click handlers with better double-tap detection
  const handleVideoClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    
    const rect = videoRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    let clientX: number;
    if ('touches' in e) {
      clientX = e.touches[0]?.clientX || e.changedTouches[0]?.clientX;
    } else {
      clientX = e.clientX;
    }
    
    const clickX = clientX - rect.left;
    const videoWidth = rect.width;
    const leftThird = videoWidth / 3;
    const rightThird = videoWidth * 2 / 3;
    
    const now = Date.now();
    const timeSinceLastTap = now - lastTap;
    
    // Enhanced touch detection for mobile
    if ('touches' in e) {
      const isDoubleTap = timeSinceLastTap < 300 && timeSinceLastTap > 50;
      
      if (isDoubleTap) {
        // Double tap - skip forward/backward based on position
        if (clickX > rightThird) {
          skipForward();
        } else if (clickX < leftThird) {
          skipBackward();
        } else {
          togglePlay();
        }
        setLastTap(0);
      } else {
        // Single tap - toggle controls only
        setShowControls(!showControls);
        showControlsWithTimeout();
        setLastTap(now);
      }
    } else {
      // Mouse clicks - toggle controls
      setShowControls(!showControls);
      showControlsWithTimeout();
    }
  };

  // Prevent control buttons from hiding controls
  const handleControlClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    // Keep controls visible when interacting with them
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
      setControlsTimeout(null);
    }
  };

  // Enhanced fullscreen for mobile with proper Safari support
  const toggleFullscreen = () => {
    if (isMobile) {
      // Use custom fullscreen for mobile devices
      setCustomFullscreen(!customFullscreen);
      
      // Lock orientation to landscape when in fullscreen
      if (!customFullscreen && 'orientation' in screen && screen.orientation) {
        try {
          // Check if lock method exists and is a function
          if ('lock' in screen.orientation && typeof screen.orientation.lock === 'function') {
            screen.orientation.lock('landscape').catch(() => {
              // Orientation lock might not be supported or allowed
            });
          }
        } catch (err) {
          // Ignore orientation lock errors
        }
      }
    } else {
      // Desktop fullscreen behavior
      const container = containerRef.current;
      if (!container) return;

      if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          (container as any).webkitRequestFullscreen();
        } else if ((container as any).mozRequestFullScreen) {
          (container as any).mozRequestFullScreen();
        } else if ((container as any).msRequestFullscreen) {
          (container as any).msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      }
    }
  };

  // Close overlays when opening another
  const handleSettingsToggle = (e: React.MouseEvent | React.TouchEvent) => {
    handleControlClick(e);
    if (showEpisodeList) {
      setShowEpisodeList(false);
      setTimeout(() => setShowSettings(!showSettings), 150);
    } else {
      setShowSettings(!showSettings);
    }
  };

  const handleEpisodeListToggle = (e: React.MouseEvent | React.TouchEvent) => {
    handleControlClick(e);
    if (showSettings) {
      setShowSettings(false);
      setTimeout(() => setShowEpisodeList(!showEpisodeList), 150);
    } else {
      setShowEpisodeList(!showEpisodeList);
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (value[0] / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0] / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed: string) => {
    const video = videoRef.current;
    if (!video) return;

    const newSpeed = parseFloat(speed);
    setPlaybackRate(newSpeed);
    video.playbackRate = newSpeed;
    setShowSettings(false);
  };

  const toggleBlur = () => {
    setIsBlurred(!isBlurred);
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCurrentEpisodeTitle = () => {
    const episodeData = getCurrentEpisodeData();
    if (episodeData) {
      return `${episodeData.title} - الموسم ${episodeData.season} الحلقة ${episodeData.episode}`;
    }
    return title;
  };

  const getSeasons = () => {
    if (!episodes.length) return [];
    const seasons = [...new Set(episodes.map(ep => ep.season))];
    return seasons.sort((a, b) => a - b);
  };

  const getEpisodesForSeason = (season: number) => {
    return episodes
      .filter(ep => ep.season === season)
      .sort((a, b) => a.episode - b.episode);
  };

  if (error) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="text-center text-white p-6">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">خطأ في تشغيل الفيديو</h3>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <div className="space-y-2">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white mr-2 min-h-[44px]"
            >
              إعادة تحميل الصفحة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full bg-black group overflow-hidden focus:outline-none touch-manipulation ${
        customFullscreen ? 'fixed inset-0 z-50 w-screen h-screen' : ''
      }`}
      tabIndex={0}
    >
      {/* Video Element with Blur Effect */}
      <div className={`w-full h-full transition-all duration-700 ease-in-out ${isBlurred ? 'filter blur-[20px] scale-105' : ''}`}>
        <video
          ref={videoRef}
          className="w-full h-full object-contain cursor-pointer"
          poster={poster}
          src={actualVideoSrc}
          crossOrigin="anonymous"
          playsInline
          preload="metadata"
          webkit-playsinline="true"
          onClick={handleVideoClick}
          onTouchEnd={handleVideoClick}
        >
          <source src={actualVideoSrc} type="video/mp4" />
          متصفحك لا يدعم تشغيل الفيديو
        </video>
      </div>

      {/* Loading Spinner */}
      {(isLoading || isBuffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600/30 border-t-red-600"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-red-600/20"></div>
            </div>
            <p className="text-white text-lg font-medium animate-pulse">
              {isBuffering ? 'جاري التحميل...' : 'جاري تحميل الفيديو...'}
            </p>
            {getCurrentEpisodeTitle() && (
              <p className="text-gray-300 text-sm text-center px-4 animate-fade-in">
                {getCurrentEpisodeTitle()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Play Button Overlay */}
      {!isPlaying && !isLoading && !isBuffering && canPlay && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div 
            className="bg-red-600/90 hover:bg-red-700 text-white rounded-full p-6 shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-red-500/50 pointer-events-auto cursor-pointer touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
          >
            <Play className="w-12 h-12 ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Episode List Overlay - Improved sizing */}
      {showEpisodeList && episodes.length > 0 && (
        <div className={`absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col z-40 transition-all duration-300 ease-in-out ${
          showEpisodeList ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-600">
            <h3 className="text-white font-semibold text-lg">قائمة الحلقات</h3>
            <Button
              onClick={(e) => {
                handleControlClick(e);
                setShowEpisodeList(false);
              }}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 min-h-[44px] w-[44px] p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {getSeasons().map(season => (
              <div key={season} className="mb-6">
                <h4 className="text-white font-medium mb-3 text-base">الموسم {season}</h4>
                <div className="space-y-2">
                  {getEpisodesForSeason(season).map(episode => (
                    <div
                      key={`${episode.season}-${episode.episode}`}
                      onClick={(e) => {
                        handleControlClick(e);
                        onEpisodeChange?.(episode.season, episode.episode);
                        setShowEpisodeList(false);
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-300 touch-manipulation ${
                        currentEpisode?.season === episode.season && currentEpisode?.episode === episode.episode
                          ? 'bg-red-600/30 border border-red-500'
                          : 'bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium text-sm">الحلقة {episode.episode}</span>
                        {episode.use_file_instead_of_url && (
                          <span className="text-green-400 text-xs bg-green-600/20 px-2 py-1 rounded">HD</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{episode.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent transition-all duration-500 z-30 ${
          showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        onClick={handleControlClick}
      >
        {/* Progress Bar */}
        <div className="px-4 pb-2">
          <Slider
            value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="w-full h-3 cursor-pointer touch-manipulation"
            onClick={handleControlClick}
          />
          <div className="flex justify-between text-xs text-gray-300 mt-1 font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Control Buttons Row */}
        <div className="flex items-center justify-between px-4 pb-4">
          {/* Left Side - Play Controls */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={(e) => {
                handleControlClick(e);
                togglePlay();
              }}
              variant="ghost"
              className="text-white hover:text-red-400 hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110 min-h-[44px] min-w-[44px]"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>

            {/* Volume Controls */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={(e) => {
                  handleControlClick(e);
                  toggleMute();
                }}
                variant="ghost"
                className="text-white hover:text-yellow-400 hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110 min-h-[44px] min-w-[44px]"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              
              {(!isMobile || isLandscape) && (
                <div className="w-20" onClick={handleControlClick}>
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="h-2 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Advanced Controls */}
          <div className="flex items-center space-x-3">
            {/* Episode List for Series */}
            {episodes.length > 0 && (
              <Button
                onClick={handleEpisodeListToggle}
                variant="ghost"
                className="text-white hover:text-purple-400 hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110 min-h-[44px] min-w-[44px]"
              >
                <List className="w-5 h-5" />
              </Button>
            )}

            {/* Settings - Enhanced with better spacing */}
            <div className="relative">
              <Button
                onClick={handleSettingsToggle}
                variant="ghost"
                className="text-white hover:text-cyan-400 hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110 min-h-[44px] min-w-[44px]"
              >
                <Settings className="w-5 h-5" />
              </Button>
              
              {showSettings && (
                <div 
                  className={`absolute bottom-full right-0 mb-3 bg-black/95 border border-gray-600 rounded-xl p-4 min-w-[140px] z-50 transition-all duration-300 ease-in-out ${
                    showSettings ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
                  }`} 
                  onClick={handleControlClick}
                >
                  <div className="space-y-3">
                    <div className="text-white text-sm font-medium mb-3 text-center">السرعة</div>
                    <div className="grid grid-cols-2 gap-2">
                      {speedOptions.map((speed) => (
                        <button
                          key={speed}
                          onClick={(e) => {
                            handleControlClick(e);
                            handleSpeedChange(speed.toString());
                          }}
                          className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 min-h-[32px] ${
                            playbackRate === speed 
                              ? 'bg-red-600 text-white shadow-lg' 
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Blur Toggle */}
            <Button
              onClick={(e) => {
                handleControlClick(e);
                toggleBlur();
              }}
              variant="ghost"
              className={`rounded-full transition-all duration-300 hover:scale-110 min-h-[44px] min-w-[44px] ${
                isBlurred 
                  ? 'text-purple-400 hover:text-purple-300 bg-purple-600/20' 
                  : 'text-white hover:text-purple-400 hover:bg-white/10'
              }`}
            >
              {isBlurred ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </Button>

            {/* Fullscreen */}
            <Button
              onClick={(e) => {
                handleControlClick(e);
                toggleFullscreen();
              }}
              variant="ghost"
              className="text-white hover:text-cyan-400 hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110 min-h-[44px] min-w-[44px]"
            >
              {customFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
