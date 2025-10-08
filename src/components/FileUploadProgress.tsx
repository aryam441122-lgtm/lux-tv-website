
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadItem {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

interface FileUploadProgressProps {
  uploads: UploadItem[];
  onCancel: (id: string) => void;
}

const FileUploadProgress: React.FC<FileUploadProgressProps> = ({ uploads, onCancel }) => {
  if (uploads.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      <h4 className="text-sm font-medium text-white">تقدم رفع الملفات</h4>
      {uploads.map((upload) => (
        <div key={upload.id} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300 truncate flex-1">{upload.name}</span>
            <div className="flex items-center space-x-2">
              {upload.status === 'uploading' && (
                <>
                  <Upload className="w-4 h-4 text-blue-400 animate-pulse" />
                  <Button
                    onClick={() => onCancel(upload.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </>
              )}
              {upload.status === 'completed' && (
                <CheckCircle className="w-4 h-4 text-green-400" />
              )}
              {upload.status === 'error' && (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Progress 
              value={upload.progress} 
              className="flex-1 h-2"
            />
            <span className="text-xs text-gray-400 min-w-[3rem]">
              {upload.progress}%
            </span>
          </div>
          
          {upload.error && (
            <p className="text-xs text-red-400 mt-1">{upload.error}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default FileUploadProgress;
