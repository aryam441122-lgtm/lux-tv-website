
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Trash2, Star, Calendar, User, Heart, BookmarkX, Sparkles, Film, Tv } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import ProfileSelector from '@/components/ProfileSelector';

interface Movie {
  id: string;
  title: string;
  description: string;
  video_url: string;
  poster_url: string;
  release_year: number;
  rating: number;
  genre: string;
  age_rating: string;
  type: 'movie' | 'series';
}

const WatchLater = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [watchLaterMovies, setWatchLaterMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { user, selectedProfile, setSelectedProfile } = useAuth();

  useEffect(() => {
    if (selectedProfile) {
      fetchWatchLaterMovies();
    }
  }, [selectedProfile]);

  const fetchWatchLaterMovies = async () => {
    if (!selectedProfile) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('watch_later')
        .select(`
          movie_id,
          movies (
            id,
            title,
            description,
            video_url,
            poster_url,
            release_year,
            rating,
            genre,
            age_rating,
            type
          )
        `)
        .eq('profile_id', selectedProfile.id);

      if (error) throw error;
      
      const movies = data?.map(item => ({
        ...item.movies,
        type: item.movies.type as 'movie' | 'series'
      })).filter(Boolean) || [];
      setWatchLaterMovies(movies as Movie[]);
    } catch (error) {
      console.error('Error fetching watch later movies:', error);
      toast({
        title: t('error'),
        description: t('error.watchlist'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchLater = async (movieId: string) => {
    if (!selectedProfile) return;

    try {
      const { error } = await supabase
        .from('watch_later')
        .delete()
        .eq('profile_id', selectedProfile.id)
        .eq('movie_id', movieId);

      if (error) throw error;
      
      setWatchLaterMovies(watchLaterMovies.filter(movie => movie.id !== movieId));
      
      toast({
        title: t('removed_from_watchlist'),
        description: t('removed_from_watchlist.desc')
      });
    } catch (error) {
      console.error('Error removing from watch later:', error);
      toast({
        title: t('error'),
        description: t('error.watchlist'),
        variant: "destructive"
      });
    }
  };

  const handleWatchMovie = (movie: Movie) => {
    navigate(`/watch/${movie.id}`, { state: { movie } });
  };

  if (!user) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Heart className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent mb-6">{t('site.title')}</h1>
          <p className="text-white text-xl mb-8">{t('watchlater.empty')}</p>
          <Button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-8 py-4 text-lg rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <User className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('nav.login')}
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedProfile) {
    return <ProfileSelector />;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-red-500/30 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/80 backdrop-blur-lg border-b-2 border-red-500/30 shadow-2xl">
        <div className="container mx-auto px-4 lg:px-6 py-4 lg:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className={`flex items-center space-x-4 lg:space-x-6 ${isRTL ? 'space-x-reverse' : ''}`}>
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="text-white hover:text-red-400 hover:bg-red-500/20 transition-all duration-300 transform hover:scale-105 p-2 lg:p-3"
              >
                <ArrowLeft className={`w-5 h-5 lg:w-6 lg:h-6 ${isRTL ? 'ml-2 lg:ml-3 rotate-180' : 'mr-2 lg:mr-3'}`} />
                <span className="hidden sm:inline">{t('notfound.return_home')}</span>
              </Button>
              <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">{t('site.title')}</h1>
              </div>
            </div>
            
            <div className={`flex items-center space-x-3 lg:space-x-6 ${isRTL ? 'space-x-reverse' : ''}`}>
              <div className={`flex items-center space-x-2 lg:space-x-3 bg-gray-800/60 px-3 lg:px-6 py-2 lg:py-3 rounded-xl backdrop-blur-sm border border-red-500/30 ${isRTL ? 'space-x-reverse' : ''}`}>
                <User className="w-4 h-4 lg:w-5 lg:h-5 text-red-400" />
                <span className="text-white font-semibold text-sm lg:text-lg">{selectedProfile.name}</span>
              </div>
              <Button
                onClick={() => setSelectedProfile(null)}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-4 lg:px-6 py-2 lg:py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-sm lg:text-base"
              >
                <span className="hidden sm:inline">{t('nav.changeProfile')}</span>
                <span className="sm:hidden">{t('profile.select')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <div className={`text-center mb-8 lg:mb-12 ${isRTL ? 'text-right' : 'text-left'} sm:text-center`}>
          <div className="flex justify-center mb-4 lg:mb-6">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <Heart className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-red-500 via-red-400 to-red-600 bg-clip-text text-transparent mb-3 lg:mb-4">
            {t('watchlater.title')} ❤️
          </h1>
          <p className="text-gray-300 text-xl lg:text-2xl font-light mb-3 lg:mb-4">
            {isRTL ? `مجموعة ${selectedProfile.name} المفضلة من الأفلام والمسلسلات` : `${selectedProfile.name}'s favorite movies and series collection`}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 lg:gap-4 text-base lg:text-lg">
            <Badge className="bg-red-600/20 text-red-400 px-3 lg:px-4 py-2 text-base lg:text-lg font-semibold border border-red-500/30">
              {watchLaterMovies.length} {isRTL ? 'عنصر' : 'items'}
            </Badge>
            <div className="text-gray-400">{isRTL ? 'في قائمة الانتظار' : 'in watchlist'}</div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 lg:py-24">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-16 w-16 lg:h-20 lg:w-20 border-4 border-red-600/30 border-t-red-600"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 lg:h-20 lg:w-20 border-4 border-transparent border-r-red-400 animate-pulse"></div>
            </div>
            <div className="text-white text-xl lg:text-2xl font-semibold mt-6 animate-pulse">{t('loading')}</div>
            <div className="text-gray-400 mt-2">{t('loading.please_wait')}</div>
          </div>
        ) : watchLaterMovies.length === 0 ? (
          <div className="text-center py-16 lg:py-24">
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-3xl p-8 lg:p-16 border-2 border-dashed border-gray-600 max-w-2xl mx-auto">
              <BookmarkX className="w-20 h-20 lg:w-24 lg:h-24 text-gray-400 mx-auto mb-6 lg:mb-8 animate-bounce" />
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 lg:mb-6 text-white">{t('watchlater.empty')} 📭</h2>
              <p className="text-gray-400 text-lg lg:text-xl mb-6 lg:mb-8 leading-relaxed">
                {t('watchlater.empty_desc')}
              </p>
              <p className="text-gray-500 text-base lg:text-lg mb-8 lg:mb-10">
                {isRTL ? 'ابدأ بإضافة المحتوى المفضل لديك واستمتع بتجربة مشاهدة مخصصة' : 'Start adding your favorite content and enjoy a personalized viewing experience'}
              </p>
              <Button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-8 lg:px-10 py-3 lg:py-4 text-lg lg:text-xl rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                <Film className={`w-5 h-5 lg:w-6 lg:h-6 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                {t('watchlater.browse')} ✨
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-8">
            {watchLaterMovies.map(movie => (
              <Card 
                key={movie.id} 
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-2 border-gray-700/50 hover:border-red-500/50 transition-all duration-500 group cursor-pointer transform hover:scale-105 hover:-translate-y-2 shadow-xl hover:shadow-2xl"
                onMouseEnter={() => setHoveredCard(movie.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-xl">
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      className="w-full h-48 sm:h-60 lg:h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent transition-all duration-500 flex items-center justify-center ${
                      hoveredCard === movie.id ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={() => handleWatchMovie(movie)}
                          size="sm"
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-xl font-bold shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300 text-xs lg:text-sm"
                        >
                          <Play className={`w-3 h-3 lg:w-5 lg:h-5 ${isRTL ? 'ml-1 lg:ml-2' : 'mr-1 lg:mr-2'}`} />
                        </Button>
                        <Button
                          onClick={() => handleRemoveFromWatchLater(movie.id)}
                          size="sm"
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-xl font-bold shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300 text-xs lg:text-sm"
                        >
                          <Trash2 className={`w-3 h-3 lg:w-5 lg:h-5 ${isRTL ? 'ml-1 lg:ml-2' : 'mr-1 lg:mr-2'}`} />
                        </Button>
                      </div>
                    </div>
                    <Badge className={`absolute top-2 lg:top-4 ${isRTL ? 'left-2 lg:left-4' : 'right-2 lg:right-4'} bg-gradient-to-r from-red-600 to-red-700 text-white px-2 lg:px-3 py-1 lg:py-2 text-xs lg:text-sm font-bold rounded-lg shadow-lg`}>
                      {movie.type === 'movie' ? (
                        <><Film className={`w-3 h-3 lg:w-4 lg:h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />{t('content.movie')}</>
                      ) : (
                        <><Tv className={`w-3 h-3 lg:w-4 lg:h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />{t('content.series')}</>
                      )}
                    </Badge>
                  </div>
                  
                  <div className="p-3 lg:p-6">
                    <h3 className={`font-bold text-white mb-2 lg:mb-3 text-sm lg:text-xl leading-tight line-clamp-2 group-hover:text-red-400 transition-colors duration-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {movie.title}
                    </h3>
                    <p className={`text-gray-400 text-xs lg:text-sm mb-3 lg:mb-4 line-clamp-3 leading-relaxed hidden sm:block ${isRTL ? 'text-right' : 'text-left'}`}>{movie.description}</p>
                    
                    <div className={`flex items-center justify-between text-xs lg:text-sm text-gray-400 mb-3 lg:mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center space-x-1 lg:space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                        <Star className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-400 fill-current" />
                        <span className="font-bold text-yellow-400">{movie.rating}</span>
                      </div>
                      <div className={`flex items-center space-x-1 lg:space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                        <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
                        <span className="font-semibold">{movie.release_year}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4 lg:mb-6 gap-2">
                      <Badge variant="secondary" className="bg-gray-700/80 text-gray-200 text-xs font-semibold px-2 lg:px-3 py-1 rounded-lg">
                        {movie.genre}
                      </Badge>
                      <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs font-semibold px-2 lg:px-3 py-1 rounded-lg">
                        {movie.age_rating}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleWatchMovie(movie)}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 lg:py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-xs lg:text-sm"
                        size="sm"
                      >
                        <Play className={`w-3 h-3 lg:w-4 lg:h-4 ${isRTL ? 'ml-1 lg:ml-2' : 'mr-1 lg:mr-2'}`} />
                      </Button>
                      <Button
                        onClick={() => handleRemoveFromWatchLater(movie.id)}
                        size="sm"
                        className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-red-600 hover:to-red-700 text-white font-bold px-3 lg:px-4 py-2 lg:py-3 rounded-xl transition-all duration-300 hover:shadow-lg"
                      >
                        <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchLater;
