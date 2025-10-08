import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UploadItem {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  file?: File;
  fileName?: string;
}

export const useVideoUpload = () => {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addUpload = useCallback((file: File, fileName: string) => {
    const uploadId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newUpload: UploadItem = {
      id: uploadId,
      name: `${fileName}.mp4`,
      progress: 0,
      status: 'uploading',
      file,
      fileName
    };

    setUploads(prev => [...prev, newUpload]);
    return uploadId;
  }, []);

  const updateUploadProgress = useCallback((id: string, progress: number) => {
    setUploads(prev => prev.map(upload => 
      upload.id === id ? { ...upload, progress } : upload
    ));
  }, []);

  const completeUpload = useCallback((id: string) => {
    setUploads(prev => prev.map(upload => 
      upload.id === id ? { ...upload, status: 'completed' as const, progress: 100 } : upload
    ));
  }, []);

  const failUpload = useCallback((id: string, error: string) => {
    setUploads(prev => prev.map(upload => 
      upload.id === id ? { ...upload, status: 'error' as const, error } : upload
    ));
  }, []);

  const removeUpload = useCallback((id: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== id));
  }, []);

  const uploadFile = useCallback(async (file: File, fileName: string, path?: string): Promise<string | null> => {
    const uploadId = addUpload(file, fileName);
    
    try {
      setIsUploading(true);
      
      // التأكد من صحة الملف
      if (!file || file.size === 0) {
        throw new Error('الملف غير صحيح أو فارغ');
      }

      // التأكد من نوع الملف
      if (!file.type.includes('video/mp4') && !file.name.toLowerCase().endsWith('.mp4')) {
        throw new Error('يرجى اختيار ملف MP4 فقط');
      }

      // التحقق من حجم الملف (2GB حد أقصى)
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
      if (file.size > maxSize) {
        throw new Error('حجم الملف يجب أن يكون أقل من 2 جيجابايت');
      }

      const cleanFileName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_');
      // إضافة مجلد movies/ إلى المسار لتوافق مع سياسات RLS
      const filePath = `movies/${path || cleanFileName}.mp4`;
      
      console.log('بدء رفع الملف:', { fileName: cleanFileName, filePath, fileSize: file.size });
      
      updateUploadProgress(uploadId, 5);

      // رفع الملف إلى Supabase Storage
      const { data, error } = await supabase.storage
        .from('movies')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('خطأ في رفع الملف:', error);
        
        // معالجة أخطاء محددة
        if (error.message.includes('duplicate')) {
          throw new Error('اسم الملف موجود مسبقاً، يرجى اختيار اسم آخر');
        } else if (error.message.includes('size')) {
          throw new Error('حجم الملف كبير جداً');
        } else if (error.message.includes('unauthorized') || error.message.includes('policy')) {
          throw new Error('ليس لديك صلاحية لرفع الملفات، تأكد من تسجيل الدخول');
        } else {
          throw new Error(`خطأ في الرفع: ${error.message}`);
        }
      }

      updateUploadProgress(uploadId, 60);

      // التحقق من نجاح الرفع
      const { data: fileInfo, error: checkError } = await supabase.storage
        .from('movies')
        .list('movies', {
          search: cleanFileName
        });

      updateUploadProgress(uploadId, 80);

      if (checkError) {
        console.error('خطأ في التحقق من الملف:', checkError);
        throw new Error('خطأ في التحقق من رفع الملف');
      }

      updateUploadProgress(uploadId, 95);
      
      // إنهاء الرفع بنجاح
      await new Promise(resolve => setTimeout(resolve, 500));
      completeUpload(uploadId);
      
      console.log('تم رفع الملف بنجاح:', data.path);
      
      toast({
        title: "تم الرفع بنجاح",
        description: `تم رفع ${cleanFileName}.mp4 بنجاح`
      });
      
      return data.path;
      
    } catch (error) {
      console.error('خطأ في عملية الرفع:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع في الرفع';
      failUpload(uploadId, errorMessage);
      
      toast({
        title: "خطأ في الرفع",
        description: errorMessage,
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [addUpload, updateUploadProgress, completeUpload, failUpload]);

  const uploadMultipleFiles = useCallback(async (
    files: Array<{ file: File; fileName: string; path?: string }>
  ): Promise<Array<{ fileName: string; path: string | null }>> => {
    setIsUploading(true);
    const results = [];
    
    console.log('بدء رفع ملفات متعددة:', files.length);
    
    try {
      for (const { file, fileName, path } of files) {
        console.log('رفع الملف:', fileName);
        const uploadedPath = await uploadFile(file, fileName, path);
        results.push({ fileName, path: uploadedPath });
        
        // توقف قصير بين الملفات
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const successfulUploads = results.filter(r => r.path !== null).length;
      
      if (successfulUploads > 0) {
        toast({
          title: "اكتمل الرفع",
          description: `تم رفع ${successfulUploads} من ${files.length} ملف بنجاح`
        });
      }
      
      return results;
    } catch (error) {
      console.error('خطأ في رفع الملفات المتعددة:', error);
      toast({
        title: "خطأ في الرفع",
        description: "حدث خطأ في رفع بعض الملفات",
        variant: "destructive"
      });
      return results;
    } finally {
      setIsUploading(false);
    }
  }, [uploadFile]);

  const cancelUpload = useCallback((id: string) => {
    console.log('إلغاء رفع الملف:', id);
    removeUpload(id);
    toast({
      title: "تم الإلغاء",
      description: "تم إلغاء رفع الملف"
    });
  }, [removeUpload]);

  const clearCompleted = useCallback(() => {
    setUploads(prev => prev.filter(upload => upload.status !== 'completed'));
  }, []);

  return {
    uploads,
    isUploading,
    uploadFile,
    uploadMultipleFiles,
    cancelUpload,
    removeUpload,
    clearCompleted
  };
};
