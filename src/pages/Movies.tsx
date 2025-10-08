import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Search, Filter, Star, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface Movie {
  id: number;
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

const Movies = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [watchLater, setWatchLater] = useState<number[]>([]);

  useEffect(() => {
    // Mock movies data (replace with Supabase data)
    const mockMovies: Movie[] = [
      {
        id: 1,
        title: "The Matrix",
        description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
        video_url: "https://example.com/matrix.mp4",
        poster_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400",
        release_year: 1999,
        rating: 8.7,
        genre: "Sci-Fi",
        age_rating: "R",
        type: "movie"
      },
      {
        id: 3,
        title: "Interstellar",
        description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        video_url: "https://example.com/interstellar.mp4",
        poster_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400",
        release_year: 2014,
        rating: 8.6,
        genre: "Sci-Fi",
        age_rating: "PG-13",
        type: "movie"
      }
    ];
    
    // Filter only movies
    const moviesOnly = mockMovies.filter(movie => movie.type === 'movie');
    setMovies(moviesOnly);
    setFilteredMovies(moviesOnly);
    
    // Load watch later from localStorage
    const savedWatchLater = localStorage.getItem('luxTV_watchLater');
    if (savedWatchLater) {
      setWatchLater(JSON.parse(savedWatchLater));
    }
  }, []);

  // Filter movies based on search and filters
  useEffect(() => {
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

    setFilteredMovies(filtered);
  }, [searchTerm, selectedGenre, selectedYear, movies]);

  const handleAddToWatchLater = (movieId: number) => {
    const newWatchLater = watchLater.includes(movieId) 
      ? watchLater.filter(id => id !== movieId)
      : [...watchLater, movieId];
    
    setWatchLater(newWatchLater);
    localStorage.setItem('luxTV_watchLater', JSON.stringify(newWatchLater));
    
    toast({
      title: watchLater.includes(movieId) ? "تم الحذف من المشاهدة لاحقاً" : "تم الإضافة للمشاهدة لاحقاً",
      description: watchLater.includes(movieId) ? "تم حذف العنصر من قائمتك" : "تم إضافة العنصر لقائمتك"
    });
  };

  const handleWatchMovie = (movie: Movie) => {
    navigate(`/watch/${movie.id}`, { state: { movie } });
  };

  const genres = [...new Set(movies.map(movie => movie.genre))];
  const years = [...new Set(movies.map(movie => movie.release_year))].sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="text-white hover:text-red-500"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                العودة
              </Button>
              <h1 className="text-2xl font-bold text-red-600">LuxTV - الأفلام</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="البحث في الأفلام..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">مكتبة الأفلام</h1>
          <p className="text-gray-400 text-lg">
            اكتشف مجموعة واسعة من الأفلام عالية الجودة
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400">تصفية النتائج:</span>
          </div>
          
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
              <SelectValue placeholder="التصنيف" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">جميع التصنيفات</SelectItem>
              {genres.map(genre => (
                <SelectItem key={genre} value={genre}>{genre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
              <SelectValue placeholder="السنة" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">جميع السنوات</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex-1" />
          
          <div className="text-gray-400">
            {filteredMovies.length} من {movies.length} فيلم
          </div>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMovies.map(movie => (
            <Card key={movie.id} className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-all duration-300 group cursor-pointer">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-72 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleWatchMovie(movie)}
                        size="sm"
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleAddToWatchLater(movie.id)}
                        size="sm"
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white ml-2"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 line-clamp-1">{movie.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span>{movie.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{movie.release_year}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">{movie.genre}</Badge>
                    <Badge variant="outline" className="text-xs">{movie.age_rating}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredMovies.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl text-gray-400 mb-2">لا توجد أفلام</h3>
            <p className="text-gray-500">جرب تغيير معايير البحث أو الفلاتر</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;
