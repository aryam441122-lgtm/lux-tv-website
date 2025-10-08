
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, File, AlertCircle, CheckCircle } from 'lucide-react';

interface VideoFileUploadProps {
  onFileSelected: (file: File, fileName: string) => void;
  onFileNameChange: (fileName: string) => void;
  fileName: string;
  disabled?: boolean;
  isEpisode?: boolean;
  episodeInfo?: { season: number; episode: number };
}

const VideoFileUpload: React.FC<VideoFileUploadProps> = ({
  onFileSelected,
  onFileNameChange,
  fileName,
  disabled = false,
  isEpisode = false,
  episodeInfo
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isValidFile, setIsValidFile] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('تم اختيار ملف:', { name: file.name, size: file.size, type: file.type });
    
    setError('');
    setIsValidFile(false);

    try {
      // التحقق من نوع الملف
      const isValidType = file.type === 'video/mp4' || 
                         file.type === 'video/quicktime' || 
                         file.name.toLowerCase().endsWith('.mp4');
      
      if (!isValidType) {
        throw new Error('يرجى اختيار ملف MP4 فقط');
      }

      // التحقق من حجم الملف (2GB حد أقصى)
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB بالبايت
      if (file.size > maxSize) {
        throw new Error('حجم الملف يجب أن يكون أقل من 2 جيجابايت');
      }

      // التحقق من أن الملف ليس فارغ
      if (file.size === 0) {
        throw new Error('الملف فارغ، يرجى اختيار ملف صحيح');
      }

      // التحقق من الحد الأدنى لحجم الملف (1KB)
      if (file.size < 1024) {
        throw new Error('الملف صغير جداً، يرجى التأكد من صحة الملف');
      }

      setSelectedFile(file);
      setIsValidFile(true);
      
      // إنشاء اسم افتراضي للملف
      let defaultName = file.name.replace(/\.mp4$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      
      if (!fileName) {
        if (isEpisode && episodeInfo) {
          defaultName = `s${episodeInfo.season}e${episodeInfo.episode}`;
        }
        onFileNameChange(defaultName);
      }

      console.log('ملف صحيح تم اختياره:', { fileName: defaultName, fileSize: file.size });
      onFileSelected(file, fileName || defaultName);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في اختيار الملف';
      setError(errorMessage);
      setSelectedFile(null);
      setIsValidFile(false);
      console.error('خطأ في اختيار الملف:', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileNameChange = (newFileName: string) => {
    // تنظيف اسم الملف
    const cleanName = newFileName.replace(/[^a-zA-Z0-9_-]/g, '_');
    onFileNameChange(cleanName);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <Label htmlFor="video-file" className="text-gray-300 text-sm">
            {isEpisode ? 'ملف الحلقة' : 'ملف الفيديو'} (MP4 فقط، حد أقصى 2GB)
          </Label>
          <div className="flex items-center space-x-2 mt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={() => document.getElementById('video-file-input')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              اختيار ملف
            </Button>
            {selectedFile && isValidFile && (
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <File className="w-4 h-4" />
                <span className="truncate max-w-32">{selectedFile.name}</span>
                <span>({formatFileSize(selectedFile.size)})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <input
        id="video-file-input"
        type="file"
        accept="video/mp4,.mp4"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {selectedFile && isValidFile && (
        <div className="space-y-2">
          <Label htmlFor="file-name" className="text-gray-300 text-sm">
            اسم الملف (مطلوب) *
          </Label>
          <Input
            id="file-name"
            value={fileName}
            onChange={(e) => handleFileNameChange(e.target.value)}
            placeholder={isEpisode ? "s1e1" : "movie_name"}
            className="bg-gray-800/50 border-gray-600 text-white"
            required
            disabled={disabled}
          />
          <p className="text-xs text-gray-500">
            سيتم حفظ الملف باسم: {fileName}.mp4 في مجلد movies
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {selectedFile && isValidFile && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>الملف جاهز للرفع - اضغط حفظ لبدء الرفع</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoFileUpload;
