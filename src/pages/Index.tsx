import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Search, Menu, X, Star, Calendar, Filter, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import ProfileSelector from '@/components/ProfileSelector';
import AdminPasswordModal from '@/components/AdminPasswordModal';
import LanguageToggle from '@/components/LanguageToggle';
import { supabase } from '@/integrations/supabase/client';

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
  episodes?: any;
}

const Index = () => {
  const { t, isRTL } = useLanguage();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [watchLater, setWatchLater] = useState<string[]>([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [searchAnimation, setSearchAnimation] = useState(false);
  const navigate = useNavigate();
  const { user, selectedProfile, setSelectedProfile, loading } = useAuth();

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    if (selectedProfile) {
      fetchWatchLater();
    }
  }, [selectedProfile]);

  const fetchMovies = async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const moviesData = (data || []).map(movie => ({
        ...movie,
        type: movie.type as 'movie' | 'series'
      }));
      setMovies(moviesData);
      setFilteredMovies(moviesData);
      if (moviesData.length > 0) {
        setHeroMovie(moviesData[0]);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const fetchWatchLater = async () => {
    if (!selectedProfile) return;
    
    try {
      const { data, error } = await supabase
        .from('watch_later')
        .select('movie_id')
        .eq('profile_id', selectedProfile.id);

      if (error) throw error;
      
      const movieIds = data?.map(item => item.movie_id) || [];
      setWatchLater(movieIds);
    } catch (error) {
      console.error('Error fetching watch later:', error);
    }
  };

  useEffect(() => {
    setSearchAnimation(true);
    const timer = setTimeout(() => {
      let filtered = movies;

      if (searchTerm) {
        filtered = filtered.filter(movie => 
          movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movie.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (selectedGenre !== 'all') {
        filtered = filtered.filter(movie => movie.genre === selectedGenre);
      }

      if (selectedYear !== 'all') {
        filtered = filtered.filter(movie => movie.release_year.toString() === selectedYear);
      }

      if (selectedType !== 'all') {
        filtered = filtered.filter(movie => movie.type === selectedType);
      }

      setFilteredMovies(filtered);
      setSearchAnimation(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedGenre, selectedYear, selectedType, movies]);

  const handleAddToWatchLater = async (movieId: string) => {
    // Check if user is logged in and has selected profile
    if (!user || !selectedProfile) {
      navigate('/login');
      return;
    }

    try {
      if (watchLater.includes(movieId)) {
        const { error } = await supabase
          .from('watch_later')
          .delete()
          .eq('profile_id', selectedProfile.id)
          .eq('movie_id', movieId);

        if (error) throw error;
        
        setWatchLater(watchLater.filter(id => id !== movieId));
        toast({
          title: t('removed_from_watchlist'),
          description: t('removed_from_watchlist.desc')
        });
      } else {
        const { error } = await supabase
          .from('watch_later')
          .insert([
            {
              profile_id: selectedProfile.id,
              movie_id: movieId
            }
          ]);

        if (error) throw error;
        
        setWatchLater([...watchLater, movieId]);
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

  const handleWatchMovie = (movie: Movie) => {
    // Check if user is logged in and has selected profile
    if (!user || !selectedProfile) {
      navigate('/login');
      return;
    }
    navigate(`/watch/${movie.id}`, { state: { movie } });
  };

  const handleAdminAccess = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowAdminModal(true);
  };

  const handleAdminSuccess = () => {
    setShowAdminModal(false);
    navigate('/admin');
  };

  const handleProfileAction = () => {
    if (!user) {
      navigate('/login');
    } else if (!selectedProfile) {
      // Show profile selector if logged in but no profile selected
      return;
    } else {
      setSelectedProfile(null);
    }
  };

  const genres = [...new Set(movies.map(movie => movie.genre))];
  const years = [...new Set(movies.map(movie => movie.release_year))].sort((a, b) => b - a);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600/30 border-t-red-600"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-red-400 animate-pulse"></div>
          </div>
          <div className="text-white text-2xl font-semibold">{t('loading')}</div>
          <div className="text-gray-400">{t('loading.please_wait')}</div>
        </div>
      </div>
    );
  }

  // Show profile selector if user is logged in but no profile is selected
  if (user && !selectedProfile) {
    return <ProfileSelector />;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-b border-red-500/30 shadow-2xl">
        <div className="container mx-auto px-6 lg:px-8 py-4 lg:py-3">
          <div className="flex items-center justify-between gap-6">
            {/* Logo Section */}
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-xl flex items-center justify-center shadow-xl">
                  <span className="text-lg lg:text-xl font-black text-white tracking-wider">LUX</span>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl lg:text-2xl font-black bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent tracking-wide">
                    {t('site.title')}
                  </h1>
                  <span className="text-xs text-gray-400 font-medium hidden sm:block">{t('site.tagline')}</span>
                </div>
              </div>
            </div>

            {/* Navigation - Desktop */}
            <nav className={`hidden lg:flex items-center ${isRTL ? 'space-x-reverse space-x-16' : 'space-x-16'} bg-black/40 backdrop-blur-sm px-12 py-3 rounded-2xl border border-red-500/20`}>
              <a href="/" className="text-white hover:text-red-400 transition-all duration-300 font-semibold border-b-2 border-red-500 pb-1">{t('nav.home')}</a>
              {user && selectedProfile && (
                <a href="/watch-later" className="text-gray-300 hover:text-red-400 transition-all duration-300 font-semibold hover:border-b-2 hover:border-red-400 pb-1">{t('nav.myList')}</a>
              )}
            </nav>
            
            {/* Right Section */}
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-6' : 'space-x-6'}`}>
              {/* Language Toggle - Desktop Only */}
              <div className="hidden lg:block">
                <LanguageToggle />
              </div>
              
              {/* Search Bar - Desktop */}
              <div className="relative hidden lg:block">
                <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                <Input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`bg-black/60 backdrop-blur-sm border-gray-600/50 text-white placeholder:text-gray-400 ${isRTL ? 'pr-12' : 'pl-12'} w-80 h-12 rounded-xl focus:border-red-500 focus:ring-red-500/30 transition-all duration-300 shadow-lg`}
                />
              </div>
              
              {/* User Profile */}
              {user && selectedProfile && (
                <div className={`hidden sm:flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'} bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-red-500/20 shadow-lg`}>
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-semibold">{selectedProfile.name}</span>
                </div>
              )}
              
              {/* Action Buttons - Desktop */}
              <div className={`hidden lg:flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                {user && selectedProfile && (
                  <>
                    <Button
                      onClick={() => navigate('/settings')}
                      className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-500/30"
                    >
                      <User className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      إعدادات الحساب
                    </Button>
                    
                    <Button
                      onClick={handleAdminAccess}
                      className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-red-500/30"
                    >
                      <Shield className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t('nav.adminPanel')}
                    </Button>
                  </>
                )}
                
                <Button
                  onClick={handleProfileAction}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 font-semibold px-6 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm"
                >
                  {!user ? t('nav.login') : t('nav.changeProfile')}
                </Button>
              </div>
              
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                className="lg:hidden text-white hover:text-red-400 hover:bg-red-500/10 p-3 rounded-xl transition-all duration-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/98 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-red-500/30">
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-xl flex items-center justify-center shadow-xl">
                  <span className="text-lg font-black text-white tracking-wider">LUX</span>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent tracking-wide">
                    {t('site.title')}
                  </h1>
                  <span className="text-xs text-gray-400 font-medium">{t('site.tagline')}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-white hover:text-red-400 hover:bg-red-500/10 p-3 rounded-xl"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* User Profile Section - Mobile */}
              {user && selectedProfile && (
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20">
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{selectedProfile.name}</h3>
                      <p className="text-gray-400 text-sm">{t('profile.welcomeBack')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="space-y-4">
                <h2 className="text-red-400 font-bold text-lg mb-6">{t('nav.menu')}</h2>
                <a 
                  href="/" 
                  className="flex items-center text-white hover:text-red-400 transition-all duration-300 font-bold py-4 px-6 rounded-xl bg-red-500/10 border border-red-500/30"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-xl">{t('nav.home')}</span>
                </a>
                {user && selectedProfile && (
                  <a 
                    href="/watch-later" 
                    className="flex items-center text-gray-300 hover:text-red-400 transition-all duration-300 font-bold py-4 px-6 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/30"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-xl">{t('nav.myList')}</span>
                  </a>
                )}
              </nav>
              
              {/* Language Toggle Section */}
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20">
                <h3 className="text-red-400 font-bold text-lg mb-4">{t('settings.language')}</h3>
                <LanguageToggle />
              </div>

              {/* Search Section */}
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20">
                <h3 className="text-red-400 font-bold text-lg mb-4">{t('search.title')}</h3>
                <div className="relative">
                  <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                  <Input
                    type="text"
                    placeholder={t('search.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`bg-black/60 border-gray-600 text-white placeholder:text-gray-400 ${isRTL ? 'pr-12' : 'pl-12'} w-full h-14 rounded-xl text-lg focus:border-red-500 focus:ring-red-500/30`}
                  />
                </div>
              </div>

              {/* Action Buttons Section */}
              <div className="space-y-4">
                <h3 className="text-red-400 font-bold text-lg mb-4">{t('nav.actions')}</h3>
                
                {user && selectedProfile && (
                  <>
                    <Button
                      onClick={() => {
                        navigate('/settings');
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
                    >
                      <User className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                      إعدادات الحساب
                    </Button>
                    
                    <Button
                      onClick={() => {
                        handleAdminAccess();
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
                    >
                      <Shield className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                      {t('nav.adminPanel')}
                    </Button>
                  </>
                )}
                
                <Button
                  onClick={() => {
                    handleProfileAction();
                    setIsMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 font-bold px-6 py-4 rounded-xl text-lg transition-all duration-300"
                >
                  {!user ? t('nav.login') : t('nav.changeProfile')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      {heroMovie && (
        <section className="relative h-screen">
          <div className="absolute inset-0">
            <img
              src={heroMovie.backdrop_url || heroMovie.poster_url}
              alt={heroMovie.title}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-${isRTL ? 'l' : 'r'} from-black/90 via-black/60 to-transparent`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 lg:px-6 h-full flex items-center">
            <div className="max-w-2xl lg:max-w-3xl">
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold mb-4 lg:mb-6 text-white drop-shadow-2xl">
                {heroMovie.title}
              </h1>
              <div className={`flex flex-wrap items-center gap-3 lg:gap-6 mb-6 lg:mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 lg:px-4 py-1 lg:py-2 text-sm lg:text-base font-semibold rounded-xl">
                  {heroMovie.type === 'movie' ? t('content.movie') : t('content.series')}
                </Badge>
                <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} bg-black/50 px-3 lg:px-4 py-1 lg:py-2 rounded-xl backdrop-blur-sm`}>
                  <Star className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-400 fill-current" />
                  <span className="text-white font-semibold text-sm lg:text-lg">{heroMovie.rating}</span>
                </div>
                <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} bg-black/50 px-3 lg:px-4 py-1 lg:py-2 rounded-xl backdrop-blur-sm`}>
                  <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-gray-300" />
                  <span className="text-white font-semibold text-sm lg:text-lg">{heroMovie.release_year}</span>
                </div>
                <Badge variant="secondary" className="bg-gray-800/80 text-gray-200 px-3 lg:px-4 py-1 lg:py-2 text-sm lg:text-base font-semibold rounded-xl">
                  {heroMovie.age_rating}
                </Badge>
              </div>
              <p className="text-lg lg:text-xl mb-8 lg:mb-10 text-gray-200 leading-relaxed max-w-xl lg:max-w-2xl line-clamp-3 lg:line-clamp-none">
                {heroMovie.description}
              </p>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:gap-8">
                <Button
                  onClick={() => handleWatchMovie(heroMovie)}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-lg lg:text-xl font-bold px-8 lg:px-12 py-3 lg:py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                  <Play className={`w-5 h-5 lg:w-6 lg:h-6 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {t('hero.playNow')}
                </Button>
                <Button
                  onClick={() => handleAddToWatchLater(heroMovie.id)}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-lg lg:text-xl font-bold px-8 lg:px-12 py-3 lg:py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl backdrop-blur-sm"
                >
                  <Plus className={`w-5 h-5 lg:w-6 lg:h-6 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {user && watchLater.includes(heroMovie.id) ? t('hero.removeFromList') : t('hero.addToList')} {t('hero.myList')}
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filters Section */}
      <section className="container mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 lg:p-8 border border-red-500/20 shadow-2xl mb-8 lg:mb-12">
          <div className="flex flex-col lg:flex-row flex-wrap items-start lg:items-center gap-4 lg:gap-6">
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
              <Filter className="w-5 h-5 lg:w-6 lg:h-6 text-red-400" />
              <span className="text-white font-semibold text-base lg:text-lg">{t('filter.title')}</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto lg:flex lg:flex-wrap">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full lg:w-48 bg-gray-800/80 border-gray-600 text-white h-12 rounded-xl font-medium">
                  <SelectValue placeholder={t('filter.type')} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">{t('filter.allTypes')}</SelectItem>
                  <SelectItem value="movie">{t('content.movies')}</SelectItem>
                  <SelectItem value="series">{t('content.series_plural')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-full lg:w-48 bg-gray-800/80 border-gray-600 text-white h-12 rounded-xl font-medium">
                  <SelectValue placeholder={t('filter.genre')} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">{t('filter.allGenres')}</SelectItem>
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full lg:w-48 bg-gray-800/80 border-gray-600 text-white h-12 rounded-xl font-medium">
                  <SelectValue placeholder={t('filter.year')} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">{t('filter.allYears')}</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-8 transition-all duration-500 ${searchAnimation ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
          {filteredMovies.map(movie => (
            <Card key={movie.id} className="bg-gray-900/80 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/90 hover:border-red-500/50 transition-all duration-500 group cursor-pointer transform hover:scale-105 hover:-translate-y-2 shadow-xl hover:shadow-2xl">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-xl">
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-48 sm:h-60 lg:h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleWatchMovie(movie)}
                        size="sm"
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300 text-xs lg:text-sm"
                      >
                        <Play className={`w-3 h-3 lg:w-5 lg:h-5 ${isRTL ? 'ml-1 lg:ml-2' : 'mr-1 lg:mr-2'}`} />
                      </Button>
                      <Button
                        onClick={() => handleAddToWatchLater(movie.id)}
                        size="sm"
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300 text-xs lg:text-sm"
                      >
                        <Plus className={`w-3 h-3 lg:w-5 lg:h-5 ${isRTL ? 'ml-1 lg:ml-2' : 'mr-1 lg:mr-2'}`} />
                      </Button>
                    </div>
                  </div>
                  <Badge className={`absolute top-2 lg:top-3 ${isRTL ? 'left-2 lg:left-3' : 'right-2 lg:right-3'} bg-gradient-to-r from-red-600 to-red-700 text-white px-2 lg:px-3 py-1 text-xs lg:text-sm font-semibold rounded-lg shadow-lg`}>
                    {movie.type === 'movie' ? t('content.movie') : t('content.series')}
                  </Badge>
                </div>
                
                <div className="p-3 lg:p-6">
                  <h3 className="font-bold text-white mb-2 lg:mb-3 text-sm lg:text-lg leading-tight line-clamp-2 group-hover:text-red-400 transition-colors duration-300">
                    {movie.title}
                  </h3>
                  <div className={`flex items-center justify-between text-xs lg:text-sm text-gray-400 mb-3 lg:mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-1 lg:space-x-2' : 'space-x-1 lg:space-x-2'}`}>
                      <Star className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-400 fill-current" />
                      <span className="font-semibold">{movie.rating}</span>
                    </div>
                    <span className="font-semibold">{movie.release_year}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="bg-gray-700/80 text-gray-200 text-xs font-medium px-2 lg:px-3 py-1 rounded-lg">
                      {movie.genre}
                    </Badge>
                    <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs font-medium px-2 lg:px-3 py-1 rounded-lg">
                      {movie.age_rating}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredMovies.length === 0 && (
          <div className="text-center py-16 lg:py-24">
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 lg:p-12 border border-gray-700/50 max-w-md mx-auto">
              <Search className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-4 lg:mb-6" />
              <h3 className="text-xl lg:text-2xl text-white font-bold mb-3 lg:mb-4">{t('no_results')}</h3>
              <p className="text-gray-400 text-base lg:text-lg">{t('no_results.desc')}</p>
            </div>
          </div>
        )}
      </section>

      {/* Admin Password Modal */}
      <AdminPasswordModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSuccess={handleAdminSuccess}
      />
    </div>
  );
};

export default Index;
