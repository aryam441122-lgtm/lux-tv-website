
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Calendar, Plus, User, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/VideoPlayer';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Json } from '@/integrations/supabase/types';

interface Episode {
  season: number;
  episode: number;
  title: string;
  video_url: string;
  video_file_path?: string;
  video_file_name?: string;
  use_file_instead_of_url?: boolean;
}

interface Movie {
  id: string;
  title: string;
  description: string;
  video_url: string;
  poster_url: string;
  backdrop_url?: string;
  release_year: number;
  rating: number;
  genre: string;
  age_rating: string;
  type: 'movie' | 'series';
  episodes?: Episode[];
  video_file_path?: string;
  video_file_name?: string;
  use_file_instead_of_url?: boolean;
}

const parseEpisodes = (episodes: Json | null): Episode[] | undefined => {
  if (!episodes) return undefined;
  
  try {
    if (Array.isArray(episodes)) {
      return episodes as unknown as Episode[];
    }
    return undefined;
  } catch {
    return undefined;
  }
};

const Watch = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, selectedProfile, loading } = useAuth();
  const { t, isRTL } = useLanguage();
  const isMobile = useIsMobile();
  const [movie, setMovie] = useState<Movie | null>(location.state?.movie || null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisodeNum, setSelectedEpisodeNum] = useState<number>(1);
  const [showEpisodesList, setShowEpisodesList] = useState(false);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

  // Handle orientation change
  useEffect(() => {
    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated
      setTimeout(() => {
        setIsPortrait(window.innerHeight > window.innerWidth);
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  // DevTools protection for desktop only
  useEffect(() => {
    if (isMobile) return;

    const isDesktop = () => {
      const ua = navigator.userAgent;
      return !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua));
    };

    if (!isDesktop()) return;

    let devToolsOpen = false;
    const threshold = 160;

    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          navigate('/');
        }
      } else {
        devToolsOpen = false;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        navigate('/');
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const consoleCheck = () => {
      const start = Date.now();
      console.log('');
      const end = Date.now();
      if (end - start > 100) {
        navigate('/');
      }
    };

    const handleResize = () => {
      detectDevTools();
    };

    detectDevTools();

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('resize', handleResize);

    const consoleInterval = setInterval(consoleCheck, 1000);

    const element = document.createElement('div');
    element.id = 'devtools-detector';
    Object.defineProperty(element, 'id', {
      get: function() {
        navigate('/');
        return 'devtools-detector';
      }
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', handleResize);
      clearInterval(consoleInterval);
    };
  }, [navigate, isMobile]);

  // Check authentication when component mounts
  useEffect(() => {
    if (!loading && (!user || !selectedProfile)) {
      navigate('/login');
      return;
    }
  }, [user, selectedProfile, loading, navigate]);

  useEffect(() => {
    if (!movie && id) {
      fetchMovie();
    }
  }, [id, movie]);

  useEffect(() => {
    if (movie?.type === 'series' && movie.episodes && movie.episodes.length > 0) {
      setCurrentEpisode(movie.episodes[0]);
      setSelectedSeason(movie.episodes[0].season);
      setSelectedEpisodeNum(movie.episodes[0].episode);
    }
  }, [movie]);

  const fetchMovie = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const movieData = {
        ...data,
        type: data.type as 'movie' | 'series',
        episodes: parseEpisodes(data.episodes)
      };
      setMovie(movieData);
    } catch (error) {
      console.error('Error fetching movie:', error);
      toast({
        title: t('error'),
        description: t('watch.error'),
        variant: "destructive"
      });
    }
  };

  const handleAddToWatchLater = async () => {
    if (!selectedProfile || !movie) return;

    try {
      const { data: existingItem } = await supabase
        .from('watch_later')
        .select('id')
        .eq('profile_id', selectedProfile.id)
        .eq('movie_id', movie.id)
        .single();

      if (existingItem) {
        const { error } = await supabase
          .from('watch_later')
          .delete()
          .eq('profile_id', selectedProfile.id)
          .eq('movie_id', movie.id);

        if (error) throw error;

        toast({
          title: t('removed_from_watchlist'),
          description: t('removed_from_watchlist.desc')
        });
      } else {
        const { error } = await supabase
          .from('watch_later')
          .insert({
            profile_id: selectedProfile.id,
            movie_id: movie.id
          });

        if (error) throw error;

        toast({
          title: t('added_to_watchlist'),
          description: t('added_to_watchlist.desc')
        });
      }
    } catch (error) {
      console.error('Error updating watch later:', error);
      toast({
        title: t('error'),
        description: t('error.watchlist'),
        variant: "destructive"
      });
    }
  };

  const handleEpisodeChange = (season: number, episode: number) => {
    if (movie?.episodes) {
      const foundEpisode = movie.episodes.find(
        ep => ep.season === season && ep.episode === episode
      );
      if (foundEpisode) {
        setCurrentEpisode(foundEpisode);
        setSelectedSeason(season);
        setSelectedEpisodeNum(episode);
        setShowEpisodesList(false);
      }
    }
  };

  const getVideoUrl = () => {
    if (movie?.type === 'series' && currentEpisode) {
      return currentEpisode.video_url;
    }
    return movie?.video_url || '';
  };

  const getVideoTitle = () => {
    if (movie?.type === 'series' && currentEpisode) {
      return isRTL 
        ? `${movie.title} - الموسم ${currentEpisode.season} - الحلقة ${currentEpisode.episode}: ${currentEpisode.title}`
        : `${movie.title} - Season ${currentEpisode.season} - Episode ${currentEpisode.episode}: ${currentEpisode.title}`;
    }
    return movie?.title || '';
  };

  const shouldUseFile = () => {
    if (movie?.type === 'series' && currentEpisode) {
      return currentEpisode.use_file_instead_of_url || false;
    }
    return movie?.use_file_instead_of_url || false;
  };

  const getFileName = () => {
    if (movie?.type === 'series' && currentEpisode) {
      return currentEpisode.video_file_name || '';
    }
    return movie?.video_file_name || '';
  };

  const getSeasons = () => {
    if (!movie?.episodes) return [];
    const seasons = [...new Set(movie.episodes.map(ep => ep.season))];
    return seasons.sort((a, b) => a - b);
  };

  const getEpisodesForSeason = (season: number) => {
    if (!movie?.episodes) return [];
    return movie.episodes
      .filter(ep => ep.season === season)
      .sort((a, b) => a.episode - b.episode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white flex items-center justify-center p-4">
        <div className="text-center bg-black/60 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-red-500/20 max-w-md w-full">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600/30 border-t-red-600 mx-auto mb-4"></div>
          <h2 className="text-xl sm:text-2xl mb-4 text-white">{t('watch.loading')}</h2>
        </div>
      </div>
    );
  }

  if (!user || !selectedProfile) {
    return null;
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white flex items-center justify-center p-4">
        <div className="text-center bg-black/60 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-red-500/20 max-w-md w-full">
          <h2 className="text-xl sm:text-2xl mb-4 text-red-400">{t('watch.not_found')}</h2>
          <Button 
            onClick={() => navigate('/')} 
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold shadow-lg w-full sm:w-auto"
          >
            {t('notfound.return_home')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header - Fixed and optimized for mobile */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-red-500/20 safe-area-top">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="sm"
                className="text-white hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 rounded-lg min-h-[44px] px-3"
              >
                <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                <span className="hidden xs:inline ml-1">{t('common.back')}</span>
              </Button>
              <h1 className="text-sm sm:text-lg font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent truncate max-w-[120px] sm:max-w-none">
                {t('site.title')}
              </h1>
            </div>
            
            {selectedProfile && (
              <div className={`flex items-center space-x-1 text-xs bg-gray-800/50 px-2 py-1 sm:py-2 rounded-full ${isRTL ? 'space-x-reverse' : ''}`}>
                <User className="w-3 h-3 text-red-400" />
                <span className="text-gray-300 max-w-[60px] sm:max-w-[120px] truncate">{selectedProfile.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="pt-14 sm:pt-16">
        {/* Video Player Container - Optimized for all orientations */}
        <div className={`relative ${isPortrait ? 'h-56 sm:h-64' : 'h-[40vh] sm:h-[50vh]'}`}>
          <div className="absolute inset-0 bg-black">
            <VideoPlayer
              src={getVideoUrl()}
              poster={movie.backdrop_url || movie.poster_url}
              title={getVideoTitle()}
              useFileInstead={shouldUseFile()}
              fileName={getFileName()}
              episodes={movie.episodes}
              currentEpisode={currentEpisode ? { season: currentEpisode.season, episode: currentEpisode.episode } : undefined}
              onEpisodeChange={handleEpisodeChange}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="container mx-auto px-3 sm:px-4 py-4 space-y-4">
          {/* Movie Info Card */}
          <Card className="bg-black/40 backdrop-blur-sm border-red-500/20 shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <h1 className={`text-lg sm:text-xl lg:text-2xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent line-clamp-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {getVideoTitle()}
              </h1>
              
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge 
                  variant="outline" 
                  className={`${movie.type === 'movie' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-purple-600/20 border-purple-500 text-purple-400'} px-2 py-1 text-xs font-medium`}
                >
                  {movie.type === 'movie' ? t('content.movie') : t('content.series')}
                </Badge>
                {shouldUseFile() && (
                  <Badge variant="outline" className="bg-green-600/20 border-green-500 text-green-400 px-2 py-1 text-xs font-medium">
                    HD
                  </Badge>
                )}
                <div className="flex items-center space-x-1 bg-yellow-500/20 px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-yellow-400 font-medium text-xs">{movie.rating}</span>
                </div>
                <div className="flex items-center space-x-1 bg-gray-700/50 px-2 py-1 rounded-full">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-300 text-xs">{movie.release_year}</span>
                </div>
                <Badge variant="outline" className="border-gray-600 text-gray-400 px-2 py-1 text-xs">
                  {movie.genre}
                </Badge>
                <Badge variant="outline" className="border-gray-600 text-gray-400 px-2 py-1 text-xs">
                  {movie.age_rating}
                </Badge>
              </div>
              
              {/* Description */}
              <p className={`text-gray-300 text-sm leading-relaxed mb-4 bg-gray-800/30 p-3 rounded-lg border border-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {movie.description}
              </p>
              
              {/* Add to Watchlist Button */}
              <Button
                onClick={handleAddToWatchLater}
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg w-full sm:w-auto min-h-[44px]"
              >
                <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('hero.addToList')} {t('hero.myList')}
              </Button>
            </CardContent>
          </Card>

          {/* Episode Selector for Series - Mobile Optimized */}
          {movie.type === 'series' && movie.episodes && (
            <Card className="bg-black/40 backdrop-blur-sm border-red-500/20 shadow-xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold text-white bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'اختيار الحلقة' : 'Select Episode'}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEpisodesList(!showEpisodesList)}
                    className="text-white hover:bg-white/10 min-h-[44px] px-3"
                  >
                    {showEpisodesList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
                
                {/* Season and Episode Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-sm font-medium text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? 'الموسم' : 'Season'}
                    </label>
                    <Select
                      value={selectedSeason.toString()}
                      onValueChange={(value) => {
                        const season = parseInt(value);
                        setSelectedSeason(season);
                        const episodes = getEpisodesForSeason(season);
                        if (episodes.length > 0) {
                          handleEpisodeChange(season, episodes[0].episode);
                        }
                      }}
                    >
                      <SelectTrigger className="bg-gray-800/70 border-gray-600 text-white focus:border-red-500 min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600 z-[9999]">
                        {getSeasons().map(season => (
                          <SelectItem key={season} value={season.toString()}>
                            {isRTL ? `الموسم ${season}` : `Season ${season}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? 'الحلقة' : 'Episode'}
                    </label>
                    <Select
                      value={selectedEpisodeNum.toString()}
                      onValueChange={(value) => {
                        const episode = parseInt(value);
                        handleEpisodeChange(selectedSeason, episode);
                      }}
                    >
                      <SelectTrigger className="bg-gray-800/70 border-gray-600 text-white focus:border-red-500 min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600 z-[9999]">
                        {getEpisodesForSeason(selectedSeason).map(episode => (
                          <SelectItem key={`${episode.season}-${episode.episode}`} value={episode.episode.toString()}>
                            {isRTL ? `الحلقة ${episode.episode}: ${episode.title}` : `Episode ${episode.episode}: ${episode.title}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Episodes List - Collapsible */}
                {showEpisodesList && (
                  <div className="mt-4">
                    <h4 className={`text-base font-semibold mb-3 text-white ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? `حلقات الموسم ${selectedSeason}` : `Season ${selectedSeason} Episodes`}
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {getEpisodesForSeason(selectedSeason).map(episode => (
                        <div
                          key={`${episode.season}-${episode.episode}`}
                          onClick={() => handleEpisodeChange(episode.season, episode.episode)}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-300 touch-manipulation ${
                            currentEpisode?.season === episode.season && currentEpisode?.episode === episode.episode
                              ? 'bg-gradient-to-r from-red-600/30 to-red-700/20 border border-red-500 shadow-lg'
                              : 'bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700 hover:border-gray-600 active:bg-gray-600/70'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                              <span className="font-medium text-white text-sm">
                                {isRTL ? `الحلقة ${episode.episode}` : `Episode ${episode.episode}`}
                              </span>
                              {episode.use_file_instead_of_url && (
                                <Badge variant="outline" className="bg-green-600/20 border-green-500 text-green-400 text-xs px-1 py-0 flex-shrink-0">
                                  HD
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className={`text-xs text-gray-400 mt-1 line-clamp-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {episode.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Safe area for iOS devices */}
      <div className="safe-area-bottom"></div>
    </div>
  );
};

export default Watch;
