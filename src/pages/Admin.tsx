import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Edit, Trash2, Star, Calendar, Play, Film, Upload, File } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import VideoFileUpload from '@/components/VideoFileUpload';
import FileUploadProgress from '@/components/FileUploadProgress';
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

// Helper functions for episode JSON conversion
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

const episodesToJson = (episodes: Episode[]): Json => {
  return episodes as unknown as Json;
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, selectedProfile } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoFileName, setVideoFileName] = useState('');
  const [useFileUpload, setUseFileUpload] = useState(false);
  const [episodeFiles, setEpisodeFiles] = useState<Map<string, {file: File, fileName: string}>>(new Map());
  
  const { uploads, isUploading, uploadFile, uploadMultipleFiles, cancelUpload } = useVideoUpload();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    poster_url: '',
    backdrop_url: '',
    release_year: new Date().getFullYear(),
    rating: 0,
    genre: '',
    age_rating: '',
    type: 'movie' as 'movie' | 'series'
  });

  useEffect(() => {
    if (user) {
      fetchMovies();
    }
  }, [user]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const moviesData = (data || []).map(movie => ({
        ...movie,
        type: movie.type as 'movie' | 'series',
        episodes: parseEpisodes(movie.episodes)
      }));
      setMovies(moviesData);
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل الأفلام",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const movieToDelete = movies.find(movie => movie.id === id);
    if (!movieToDelete) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على المحتوى",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      console.log('بدء عملية حذف الفيلم:', { id, isLocalFile: movieToDelete.use_file_instead_of_url, filePath: movieToDelete.video_file_path });

      // حذف المراجع في الجداول الأخرى أولاً
      const { error: watchLaterError } = await supabase
        .from('watch_later')
        .delete()
        .eq('movie_id', id);

      if (watchLaterError) {
        console.error('خطأ في حذف مراجع watch_later:', watchLaterError);
      } else {
        console.log('تم حذف مراجع watch_later بنجاح');
      }

      const { error: watchHistoryError } = await supabase
        .from('watch_history')
        .delete()
        .eq('movie_id', id);

      if (watchHistoryError) {
        console.error('خطأ في حذف مراجع watch_history:', watchHistoryError);
      } else {
        console.log('تم حذف مراجع watch_history بنجاح');
      }

      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .eq('movie_id', id);

      if (commentsError) {
        console.error('خطأ في حذف التعليقات:', commentsError);
      } else {
        console.log('تم حذف التعليقات بنجاح');
      }

      const { error: ratingsError } = await supabase
        .from('movie_ratings')
        .delete()
        .eq('movie_id', id);

      if (ratingsError) {
        console.error('خطأ في حذف التقييمات:', ratingsError);
      } else {
        console.log('تم حذف التقييمات بنجاح');
      }

      // حذف الملفات المحلية إذا كانت موجودة
      if (movieToDelete.use_file_instead_of_url) {
        // حذف ملف الفيديو الرئيسي
        if (movieToDelete.video_file_path) {
          console.log('محاولة حذف الملف الرئيسي:', movieToDelete.video_file_path);
          const { error: fileDeleteError } = await supabase.storage
            .from('movies')
            .remove([movieToDelete.video_file_path]);

          if (fileDeleteError) {
            console.error('خطأ في حذف الملف الرئيسي:', fileDeleteError);
          } else {
            console.log('تم حذف الملف الرئيسي بنجاح');
          }
        }

        // حذف ملفات الحلقات إذا كان مسلسل
        if (movieToDelete.type === 'series' && movieToDelete.episodes) {
          const episodeFilesToDelete = movieToDelete.episodes
            .filter(episode => episode.video_file_path)
            .map(episode => episode.video_file_path!);

          if (episodeFilesToDelete.length > 0) {
            console.log('محاولة حذف ملفات الحلقات:', episodeFilesToDelete);
            const { error: episodeFilesError } = await supabase.storage
              .from('movies')
              .remove(episodeFilesToDelete);

            if (episodeFilesError) {
              console.error('خطأ في حذف ملفات الحلقات:', episodeFilesError);
            } else {
              console.log('تم حذف ملفات الحلقات بنجاح');
            }
          }
        }
      }

      // أخيراً، حذف الفيلم من قاعدة البيانات
      console.log('محاولة حذف الفيلم من قاعدة البيانات...');
      const { error: movieDeleteError } = await supabase
        .from('movies')
        .delete()
        .eq('id', id);

      if (movieDeleteError) {
        console.error('خطأ في حذف الفيلم:', movieDeleteError);
        throw new Error(`فشل في حذف المحتوى: ${movieDeleteError.message}`);
      }
      
      console.log('تم حذف الفيلم بنجاح من قاعدة البيانات');
      
      // تحديث القائمة المحلية
      setMovies(movies.filter(movie => movie.id !== id));
      
      toast({
        title: "تم الحذف",
        description: movieToDelete.use_file_instead_of_url 
          ? "تم حذف المحتوى والملفات المرتبطة بنجاح" 
          : "تم حذف المحتوى بنجاح"
      });
      
    } catch (error) {
      console.error('خطأ عام في حذف المحتوى:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      
      toast({
        title: "خطأ في الحذف",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('بدء عملية الحفظ:', { 
      useFileUpload, 
      hasVideoFile: !!selectedVideoFile, 
      videoFileName,
      formType: formData.type,
      episodeCount: episodes.length,
      episodeFilesCount: episodeFiles.size
    });
    
    try {
      // التحقق من البيانات الأساسية
      if (!formData.title.trim()) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال عنوان المحتوى",
          variant: "destructive"
        });
        return;
      }

      // التحقق من مصدر الفيديو
      if (!useFileUpload && !formData.video_url.trim()) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال رابط الفيديو أو اختيار ملف",
          variant: "destructive"
        });
        return;
      }

      // التحقق من ملف الفيديو للأفلام
      if (useFileUpload && formData.type === 'movie') {
        if (!selectedVideoFile) {
          toast({
            title: "خطأ",
            description: "يرجى اختيار ملف الفيديو",
            variant: "destructive"
          });
          return;
        }
        
        if (!videoFileName.trim()) {
          toast({
            title: "خطأ",
            description: "يرجى إدخال اسم الملف",
            variant: "destructive"
          });
          return;
        }
      }

      // للمسلسلات: التحقق من وجود حلقات وملفاتها إذا كان يستخدم رفع الملفات
      if (formData.type === 'series') {
        if (episodes.length === 0) {
          toast({
            title: "خطأ",
            description: "يرجى إضافة حلقة واحدة على الأقل للمسلسل",
            variant: "destructive"
          });
          return;
        }

        if (useFileUpload) {
          // للمسلسلات التي تستخدم الملفات، يجب أن تكون كل الحلقات لها ملفات
          const missingFiles = episodes.some((_, index) => !episodeFiles.has(`${episodes[index].season.toString()}-${episodes[index].episode.toString()}`));
          if (missingFiles) {
            toast({
              title: "خطأ",
              description: "يرجى اختيار ملفات لجميع الحلقات",
              variant: "destructive"
            });
            return;
          }
        } else {
          // للمسلسلات التي تستخدم الروابط، يجب أن تكون كل الحلقات لها روابط
          const missingUrls = episodes.some(episode => !episode.video_url.trim());
          if (missingUrls) {
            toast({
              title: "خطأ",
              description: "يرجى إدخال روابط لجميع الحلقات",
              variant: "destructive"
            });
            return;
          }
        }
      }

      setLoading(true);
      
      let movieData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        use_file_instead_of_url: useFileUpload,
        video_file_path: null as string | null,
        video_file_name: null as string | null,
        episodes: formData.type === 'series' ? episodesToJson(episodes) : null
      };

      console.log('بيانات الفيلم قبل الرفع:', movieData);

      // رفع ملف الفيديو للأفلام
      if (useFileUpload && selectedVideoFile && formData.type === 'movie') {
        console.log('بدء رفع ملف الفيلم:', videoFileName);
        
        const cleanTitle = formData.title.replace(/[^a-zA-Z0-9_-]/g, '_');
        const uploadPath = `${cleanTitle}_${videoFileName}`;
        
        const uploadedPath = await uploadFile(selectedVideoFile, videoFileName, uploadPath);
        if (!uploadedPath) {
          throw new Error('فشل في رفع ملف الفيديو');
        }
        
        console.log('تم رفع ملف الفيلم بنجاح:', uploadedPath);
        movieData.video_file_path = uploadedPath;
        movieData.video_file_name = `${uploadPath}.mp4`;
        movieData.video_url = ''; // إفراغ رابط الفيديو عند استخدام الملف
      }

      // رفع ملفات حلقات المسلسل
      if (useFileUpload && formData.type === 'series' && episodeFiles.size > 0) {
        console.log('بدء رفع ملفات الحلقات:', episodeFiles.size);
        
        const cleanTitle = formData.title.replace(/[^a-zA-Z0-9_-]/g, '_');
        
        const filesToUpload = Array.from(episodeFiles.entries()).map(([episodeKey, {file, fileName}]) => {
          const [seasonStr, episodeStr] = episodeKey.split('-');
          const season = parseInt(seasonStr);
          const episode = parseInt(episodeStr);
          const episodePath = `${cleanTitle}_s${season}e${episode}_${fileName}`;
          return {
            file,
            fileName,
            path: episodePath,
            episodeKey,
            season,
            episode
          };
        });

        const uploadResults = await uploadMultipleFiles(filesToUpload.map(f => ({
          file: f.file,
          fileName: f.fileName,
          path: f.path
        })));
        
        console.log('نتائج رفع ملفات الحلقات:', uploadResults);
        
        // تحديث بيانات الحلقات مع مسارات الملفات المرفوعة
        const updatedEpisodes = episodes.map((episode) => {
          const episodeKey = `${episode.season.toString()}-${episode.episode.toString()}`;
          const fileUpload = filesToUpload.find(f => f.episodeKey === episodeKey);
          const uploadResult = uploadResults.find(result => 
            result.fileName === fileUpload?.fileName
          );
          
          if (uploadResult && uploadResult.path && fileUpload) {
            return {
              ...episode,
              video_file_path: uploadResult.path,
              video_file_name: `${fileUpload.path}.mp4`,
              use_file_instead_of_url: true,
              video_url: '' // إفراغ رابط الفيديو عند استخدام الملف
            };
          }
          return episode;
        });

        movieData.episodes = episodesToJson(updatedEpisodes);
        
        // للمسلسلات: جعل الحلقة الأولى هي مصدر الفيديو الرئيسي
        const firstEpisode = updatedEpisodes.find(ep => ep.season === 1 && ep.episode === 1);
        if (firstEpisode && firstEpisode.video_file_path) {
          movieData.video_file_path = firstEpisode.video_file_path;
          movieData.video_file_name = firstEpisode.video_file_name;
          movieData.video_url = ''; // إفراغ رابط الفيديو عند استخدام الملف
        }
        
        console.log('تم تحديث بيانات الحلقات وتعيين الحلقة الأولى كمصدر رئيسي:', updatedEpisodes);
      }

      // حفظ البيانات في قاعدة البيانات
      console.log('حفظ البيانات في قاعدة البيانات...');
      
      if (editingId) {
        console.log('تحديث فيلم موجود:', editingId);
        const { error } = await supabase
          .from('movies')
          .update(movieData)
          .eq('id', editingId);

        if (error) {
          console.error('خطأ في تحديث الفيلم:', error);
          throw new Error(`فشل في تحديث المحتوى: ${error.message}`);
        }
        
        setMovies(movies.map(movie => 
          movie.id === editingId ? { 
            ...movie, 
            ...movieData, 
            episodes: parseEpisodes(movieData.episodes) 
          } : movie
        ));
        
        toast({
          title: "تم التحديث",
          description: "تم تحديث المحتوى بنجاح"
        });
      } else {
        console.log('إضافة فيلم جديد');
        const { data, error } = await supabase
          .from('movies')
          .insert([movieData])
          .select()
          .single();

        if (error) {
          console.error('خطأ في إضافة الفيلم:', error);
          throw new Error(`فشل في إضافة المحتوى: ${error.message}`);
        }
        
        if (!data) {
          throw new Error('لم يتم إرجاع بيانات المحتوى المضاف');
        }
        
        const newMovie = {
          ...data,
          type: data.type as 'movie' | 'series',
          episodes: parseEpisodes(data.episodes)
        };
        
        setMovies([newMovie, ...movies]);
        
        toast({
          title: "تم الإضافة",
          description: useFileUpload 
            ? "تم إضافة المحتوى ورفع الملفات بنجاح" 
            : "تم إضافة المحتوى بنجاح"
        });
      }
      
      resetForm();
    } catch (error) {
      console.error('خطأ في حفظ المحتوى:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      
      toast({
        title: "خطأ في الحفظ",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (movie: Movie) => {
    setFormData({
      title: movie.title,
      description: movie.description,
      video_url: movie.video_url,
      poster_url: movie.poster_url,
      backdrop_url: movie.backdrop_url || '',
      release_year: movie.release_year,
      rating: movie.rating,
      genre: movie.genre,
      age_rating: movie.age_rating,
      type: movie.type
    });
    setEpisodes(movie.episodes || []);
    setUseFileUpload(movie.use_file_instead_of_url || false);
    setVideoFileName(movie.video_file_name?.replace('.mp4', '') || '');
    setEditingId(movie.id);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      video_url: '',
      poster_url: '',
      backdrop_url: '',
      release_year: new Date().getFullYear(),
      rating: 0,
      genre: '',
      age_rating: '',
      type: 'movie'
    });
    setEpisodes([]);
    setEditingId(null);
    setSelectedVideoFile(null);
    setVideoFileName('');
    setUseFileUpload(false);
    setEpisodeFiles(new Map());
  };

  const addEpisode = () => {
    setEpisodes([...episodes, {
      season: 1,
      episode: episodes.length + 1,
      title: '',
      video_url: ''
    }]);
  };

  const updateEpisode = (index: number, field: keyof Episode, value: string | number | boolean) => {
    const updatedEpisodes = episodes.map((ep, i) => 
      i === index ? { ...ep, [field]: value } : ep
    );
    setEpisodes(updatedEpisodes);
  };

  const removeEpisode = (index: number) => {
    const episodeToRemove = episodes[index];
    if (episodeToRemove) {
      const episodeKey = `${episodeToRemove.season.toString()}-${episodeToRemove.episode.toString()}`;
      const newEpisodeFiles = new Map(episodeFiles);
      newEpisodeFiles.delete(episodeKey);
      setEpisodeFiles(newEpisodeFiles);
    }
    setEpisodes(episodes.filter((_, i) => i !== index));
  };

  const handleEpisodeFileSelected = (index: number, file: File, fileName: string) => {
    const episode = episodes[index];
    if (!episode) return;
    
    const episodeKey = `${episode.season.toString()}-${episode.episode.toString()}`;
    console.log('تم اختيار ملف للحلقة:', { 
      index, 
      episodeKey, 
      fileName, 
      fileSize: file.size,
      season: episode.season,
      episode: episode.episode
    });
    
    const newEpisodeFiles = new Map(episodeFiles);
    newEpisodeFiles.set(episodeKey, { file, fileName });
    setEpisodeFiles(newEpisodeFiles);
  };

  const handleVideoFileSelected = (file: File, fileName: string) => {
    console.log('تم اختيار ملف الفيديو الرئيسي:', { fileName, fileSize: file.size });
    setSelectedVideoFile(file);
    setVideoFileName(fileName);
  };

  const getEpisodeFile = (index: number) => {
    const episode = episodes[index];
    if (!episode) return null;
    
    const episodeKey = `${episode.season.toString()}-${episode.episode.toString()}`;
    return episodeFiles.get(episodeKey);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="text-center bg-black/60 backdrop-blur-sm p-8 rounded-2xl border border-red-500/20">
          <h1 className="text-4xl font-bold text-red-500 mb-4">LuxTV Admin</h1>
          <p className="text-gray-300 mb-6">يجب تسجيل الدخول للوصول لوحة الإدارة</p>
          <Button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
          >
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-sm border-b border-red-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="text-white hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                العودة للرئيسية
              </Button>
              <div className="flex items-center space-x-3">
                <Film className="w-8 h-8 text-red-500" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
                  LuxTV Admin
                </h1>
              </div>
            </div>
            
            <div className="text-sm text-gray-300 bg-gray-800/50 px-4 py-2 rounded-full">
              مرحباً، {selectedProfile?.name || user.email}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <FileUploadProgress uploads={uploads} onCancel={cancelUpload} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <Card className="bg-black/40 backdrop-blur-sm border-red-500/20 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-red-600/20 to-red-700/20 border-b border-red-500/20">
                <CardTitle className="text-xl text-white flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-red-400" />
                  {editingId ? 'تعديل المحتوى' : 'إضافة محتوى جديد'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-300 font-medium">العنوان *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="اسم الفيلم أو المسلسل"
                      className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20 transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-gray-300 font-medium">النوع</Label>
                    <Select value={formData.type} onValueChange={(value: 'movie' | 'series') => setFormData({...formData, type: value})}>
                      <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white focus:border-red-500 focus:ring-red-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="movie">فيلم</SelectItem>
                        <SelectItem value="series">مسلسل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Video Upload/URL Section */}
                  <div className="space-y-4 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300 font-medium">مصدر الفيديو</Label>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="use-file-upload" className="text-sm text-gray-400">رفع ملف</Label>
                        <Switch
                          id="use-file-upload"
                          checked={useFileUpload}
                          onCheckedChange={setUseFileUpload}
                        />
                      </div>
                    </div>

                    {useFileUpload ? (
                      formData.type === 'movie' ? (
                        <VideoFileUpload
                          onFileSelected={handleVideoFileSelected}
                          onFileNameChange={setVideoFileName}
                          fileName={videoFileName}
                          disabled={loading || isUploading}
                        />
                      ) : (
                        <div className="text-sm text-gray-400 p-3 bg-gray-800/30 rounded">
                          سيتم تحديد مصدر الفيديو من الحلقة الأولى (الموسم 1، الحلقة 1)
                        </div>
                      )
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="video_url" className="text-gray-300 font-medium">رابط الفيديو *</Label>
                        <Input
                          id="video_url"
                          value={formData.video_url}
                          onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                          placeholder="https://example.com/video.mp4"
                          className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20"
                          required={!useFileUpload}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-300 font-medium">الوصف</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="وصف الفيلم أو المسلسل"
                      className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20 transition-all duration-300 min-h-24"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="release_year" className="text-gray-300 font-medium">سنة الإصدار</Label>
                      <Input
                        id="release_year"
                        type="number"
                        value={formData.release_year}
                        onChange={(e) => setFormData({...formData, release_year: parseInt(e.target.value)})}
                        className="bg-gray-800/50 border-gray-600 text-white focus:border-red-500 focus:ring-red-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rating" className="text-gray-300 font-medium">التقييم</Label>
                      <Input
                        id="rating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={formData.rating}
                        onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                        className="bg-gray-800/50 border-gray-600 text-white focus:border-red-500 focus:ring-red-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="genre" className="text-gray-300 font-medium">التصنيف</Label>
                      <Input
                        id="genre"
                        value={formData.genre}
                        onChange={(e) => setFormData({...formData, genre: e.target.value})}
                        placeholder="أكشن، دراما، كوميديا"
                        className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age_rating" className="text-gray-300 font-medium">التصنيف العمري</Label>
                      <Input
                        id="age_rating"
                        value={formData.age_rating}
                        onChange={(e) => setFormData({...formData, age_rating: e.target.value})}
                        placeholder="PG-13, +18, عائلي"
                        className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="poster_url" className="text-gray-300 font-medium">رابط الصورة المصغرة</Label>
                    <Input
                      id="poster_url"
                      value={formData.poster_url}
                      onChange={(e) => setFormData({...formData, poster_url: e.target.value})}
                      placeholder="https://example.com/poster.jpg"
                      className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backdrop_url" className="text-gray-300 font-medium">رابط الخلفية</Label>
                    <Input
                      id="backdrop_url"
                      value={formData.backdrop_url}
                      onChange={(e) => setFormData({...formData, backdrop_url: e.target.value})}
                      placeholder="https://example.com/backdrop.jpg"
                      className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20"
                    />
                  </div>

                  {/* Episodes Section for Series */}
                  {formData.type === 'series' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300 font-medium">الحلقات</Label>
                        <Button
                          type="button"
                          onClick={addEpisode}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg font-medium shadow-lg"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          إضافة حلقة
                        </Button>
                      </div>
                      
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {episodes.map((episode, index) => {
                          const episodeFile = getEpisodeFile(index);
                          const isFirstEpisode = episode.season === 1 && episode.episode === 1;
                          
                          return (
                            <div key={`${episode.season}-${episode.episode}-${index}`} className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                              {isFirstEpisode && useFileUpload && (
                                <div className="mb-3 p-2 bg-green-600/20 border border-green-500/30 rounded text-green-400 text-sm">
                                  🎬 هذه الحلقة ستكون مصدر الفيديو الرئيسي للمسلسل
                                </div>
                              )}
                              
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <Input
                                  type="number"
                                  placeholder="الموسم"
                                  value={episode.season}
                                  onChange={(e) => updateEpisode(index, 'season', parseInt(e.target.value))}
                                  className="bg-gray-700/50 border-gray-600 text-white"
                                />
                                <Input
                                  type="number"
                                  placeholder="رقم الحلقة"
                                  value={episode.episode}
                                  onChange={(e) => updateEpisode(index, 'episode', parseInt(e.target.value))}
                                  className="bg-gray-700/50 border-gray-600 text-white"
                                />
                              </div>
                              <Input
                                placeholder="عنوان الحلقة"
                                value={episode.title}
                                onChange={(e) => updateEpisode(index, 'title', e.target.value)}
                                className="bg-gray-700/50 border-gray-600 text-white mb-3"
                              />
                              
                              {/* Episode Video Source */}
                              {useFileUpload ? (
                                <div className="space-y-2">
                                  <Label className="text-sm text-gray-400">
                                    ملف الحلقة {episode.episode} - الموسم {episode.season}
                                    {isFirstEpisode && <span className="text-green-400 mr-2">(مصدر رئيسي)</span>}
                                  </Label>
                                  <div className="border border-gray-600 rounded-lg p-3 bg-gray-700/30">
                                    <div className="flex items-center gap-3 mb-2">
                                      <Input
                                        placeholder={`اسم ملف الحلقة ${episode.episode}`}
                                        value={episodeFile?.fileName || ''}
                                        onChange={(e) => {
                                          const episodeKey = `${episode.season.toString()}-${episode.episode.toString()}`;
                                          const existingFile = episodeFiles.get(episodeKey);
                                          if (existingFile) {
                                            const newFiles = new Map(episodeFiles);
                                            newFiles.set(episodeKey, { ...existingFile, fileName: e.target.value });
                                            setEpisodeFiles(newFiles);
                                          }
                                        }}
                                        className="bg-gray-600/50 border-gray-500 text-white text-sm flex-1"
                                      />
                                      <Button
                                        type="button"
                                        onClick={() => {
                                          const input = document.createElement('input');
                                          input.type = 'file';
                                          input.accept = 'video/*';
                                          input.onchange = (e) => {
                                            const file = (e.target as HTMLInputElement).files?.[0];
                                            if (file) {
                                              const fileName = episodeFile?.fileName || `episode_${episode.episode}`;
                                              handleEpisodeFileSelected(index, file, fileName);
                                            }
                                          };
                                          input.click();
                                        }}
                                        disabled={loading || isUploading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"
                                      >
                                        <Upload className="w-3 h-3 mr-1" />
                                        اختر ملف
                                      </Button>
                                    </div>
                                    {episodeFile && (
                                      <div className="flex items-center gap-2 text-xs text-green-400">
                                        <File className="w-3 h-3" />
                                        <span>تم اختيار: {episodeFile.file.name}</span>
                                        <span className="text-gray-500">
                                          ({(episodeFile.file.size / (1024 * 1024)).toFixed(1)} MB)
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="رابط الحلقة"
                                    value={episode.video_url}
                                    onChange={(e) => updateEpisode(index, 'video_url', e.target.value)}
                                    className="bg-gray-700/50 border-gray-600 text-white flex-1"
                                  />
                                </div>
                              )}
                              
                              <Button
                                type="button"
                                onClick={() => removeEpisode(index)}
                                variant="outline"
                                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white mt-3 w-full"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                حذف الحلقة
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={loading || isUploading}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300"
                    >
                      {loading || isUploading ? 'جاري الرفع والمعالجة...' : (editingId ? 'تحديث' : 'إضافة')}
                    </Button>
                    {editingId && (
                      <Button
                        type="button"
                        onClick={resetForm}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white px-6 py-3 rounded-xl"
                      >
                        إلغاء
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Movies List */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 backdrop-blur-sm border-red-500/20 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-red-600/20 to-red-700/20 border-b border-red-500/20">
                <CardTitle className="text-xl text-white flex items-center">
                  <Film className="w-5 h-5 mr-2 text-red-400" />
                  المحتوى المتاح ({movies.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400">جاري التحميل...</div>
                  </div>
                ) : movies.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">لا يوجد محتوى بعد</div>
                    <p className="text-gray-500 text-sm">ابدأ بإضافة أول فيلم أو مسلسل</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                    {movies.map(movie => (
                      <div key={movie.id} className="bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl border border-gray-700 hover:border-red-500/50 transition-all duration-300">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">{movie.title}</h3>
                              <Badge 
                                variant="outline" 
                                className={`${movie.type === 'movie' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-purple-600/20 border-purple-500 text-purple-400'}`}
                              >
                                {movie.type === 'movie' ? 'فيلم' : 'مسلسل'}
                              </Badge>
                              {movie.use_file_instead_of_url && (
                                <Badge variant="outline" className="bg-green-600/20 border-green-500 text-green-400">
                                  ملف محلي
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{movie.description}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span>{movie.rating}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{movie.release_year}</span>
                              </div>
                              <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                                {movie.genre}
                              </Badge>
                              {movie.type === 'series' && movie.episodes && (
                                <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                                  {movie.episodes.length} حلقة
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              onClick={() => navigate(`/watch/${movie.id}`, { state: { movie } })}
                              size="sm"
                              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-3 py-2 rounded-lg shadow-md"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              مشاهدة
                            </Button>
                            <Button
                              onClick={() => handleEdit(movie)}
                              size="sm"
                              variant="outline"
                              className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-lg"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              تعديل
                            </Button>
                            <Button
                              onClick={() => handleDelete(movie.id)}
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white px-3 py-2 rounded-lg"
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              {loading ? 'جاري الحذف...' : 'حذف'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
