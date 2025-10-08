
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Search, Filter, Star, Calendar, ArrowLeft, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface Episode {
  season: number;
  episode: number;
  title: string;
  video_url: string;
}

interface Series {
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
  episodes?: Episode[];
}

const Series = () => {
  const navigate = useNavigate();
  const [series, setSeries] = useState<Series[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [watchLater, setWatchLater] = useState<number[]>([]);

  useEffect(() => {
    // Mock series data (replace with Supabase data)
    const mockSeries: Series[] = [
      {
        id: 2,
        title: "Stranger Things",
        description: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces.",
        video_url: "https://example.com/stranger-things.mp4",
        poster_url: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400",
        release_year: 2016,
        rating: 8.5,
        genre: "Horror",
        age_rating: "TV-14",
        type: "series",
        episodes: [
          { season: 1, episode: 1, title: "Chapter One", video_url: "https://example.com/st-s1e1.mp4" },
          { season: 1, episode: 2, title: "Chapter Two", video_url: "https://example.com/st-s1e2.mp4" },
          { season: 1, episode: 3, title: "Chapter Three", video_url: "https://example.com/st-s1e3.mp4" },
          { season: 2, episode: 1, title: "MADMAX", video_url: "https://example.com/st-s2e1.mp4" },
          { season: 2, episode: 2, title: "Trick or Treat", video_url: "https://example.com/st-s2e2.mp4" }
        ]
      },
      {
        id: 4,
        title: "Breaking Bad",
        description: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.",
        video_url: "https://example.com/breaking-bad.mp4",
        poster_url: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400",
        release_year: 2008,
        rating: 9.5,
        genre: "Drama",
        age_rating: "TV-MA",
        type: "series",
        episodes: [
          { season: 1, episode: 1, title: "Pilot", video_url: "https://example.com/bb-s1e1.mp4" },
          { season: 1, episode: 2, title: "Cat's in the Bag", video_url: "https://example.com/bb-s1e2.mp4" }
        ]
      }
    ];
    
    // Filter only series
    const seriesOnly = mockSeries.filter(item => item.type === 'series');
    setSeries(seriesOnly);
    setFilteredSeries(seriesOnly);
    
    // Load watch later from localStorage
    const savedWatchLater = localStorage.getItem('luxTV_watchLater');
    if (savedWatchLater) {
      setWatchLater(JSON.parse(savedWatchLater));
    }
  }, []);

  // Filter series based on search and filters
  useEffect(() => {
    let filtered = series;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGenre !== 'all') {
      filtered = filtered.filter(item => item.genre === selectedGenre);
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter(item => item.release_year.toString() === selectedYear);
    }

    setFilteredSeries(filtered);
  }, [searchTerm, selectedGenre, selectedYear, series]);

  const handleAddToWatchLater = (seriesId: number) => {
    const newWatchLater = watchLater.includes(seriesId) 
      ? watchLater.filter(id => id !== seriesId)
      : [...watchLater, seriesId];
    
    setWatchLater(newWatchLater);
    localStorage.setItem('luxTV_watchLater', JSON.stringify(newWatchLater));
    
    toast({
      title: watchLater.includes(seriesId) ? "تم الحذف من المشاهدة لاحقاً" : "تم الإضافة للمشاهدة لاحقاً",
      description: watchLater.includes(seriesId) ? "تم حذف العنصر من قائمتك" : "تم إضافة العنصر لقائمتك"
    });
  };

  const handleWatchSeries = (seriesItem: Series) => {
    navigate(`/watch/${seriesItem.id}`, { state: { movie: seriesItem } });
  };

  const getEpisodeCount = (seriesItem: Series) => {
    return seriesItem.episodes ? seriesItem.episodes.length : 0;
  };

  const getSeasonCount = (seriesItem: Series) => {
    if (!seriesItem.episodes) return 0;
    const seasons = [...new Set(seriesItem.episodes.map(ep => ep.season))];
    return seasons.length;
  };

  const genres = [...new Set(series.map(item => item.genre))];
  const years = [...new Set(series.map(item => item.release_year))].sort((a, b) => b - a);

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
              <h1 className="text-2xl font-bold text-red-600">LuxTV - المسلسلات</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="البحث في المسلسلات..."
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
          <h1 className="text-4xl font-bold mb-4">مكتبة المسلسلات</h1>
          <p className="text-gray-400 text-lg">
            تابع أحدث وأفضل المسلسلات من حول العالم
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
            {filteredSeries.length} من {series.length} مسلسل
          </div>
        </div>

        {/* Series Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSeries.map(seriesItem => (
            <Card key={seriesItem.id} className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-all duration-300 group cursor-pointer">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={seriesItem.poster_url}
                    alt={seriesItem.title}
                    className="w-full h-80 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleWatchSeries(seriesItem)}
                        size="sm"
                        className="bg-white text-black hover:bg-gray-200"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        تشغيل
                      </Button>
                      <Button
                        onClick={() => handleAddToWatchLater(seriesItem.id)}
                        size="sm"
                        variant="outline"
                        className="border-white text-white hover:bg-white hover:text-black"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        قائمة
                      </Button>
                    </div>
                  </div>
                  <Badge 
                    className="absolute top-2 right-2 bg-green-600/90 text-white"
                  >
                    <Tv className="w-3 h-3 mr-1" />
                    مسلسل
                  </Badge>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 line-clamp-1">{seriesItem.title}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{seriesItem.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span>{seriesItem.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{seriesItem.release_year}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">{seriesItem.genre}</Badge>
                    <Badge variant="outline" className="text-xs">{seriesItem.age_rating}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <span>{getSeasonCount(seriesItem)} مواسم</span>
                    <span>{getEpisodeCount(seriesItem)} حلقة</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleWatchSeries(seriesItem)}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      مشاهدة
                    </Button>
                    <Button
                      onClick={() => handleAddToWatchLater(seriesItem.id)}
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredSeries.length === 0 && (
          <div className="text-center py-16">
            <Tv className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl text-gray-400 mb-2">لا توجد مسلسلات</h3>
            <p className="text-gray-500">جرب تغيير معايير البحث أو الفلاتر</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Series;
