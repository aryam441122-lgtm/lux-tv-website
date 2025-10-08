
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminPasswordModal = ({ isOpen, onClose, onSuccess }: AdminPasswordModalProps) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Check exact password match
    if (password === '7YqqJkm3km1UdrwsGK3c') {
      toast({
        title: "تم التحقق بنجاح",
        description: "مرحباً بك في لوحة إدارة المحتوى"
      });
      onSuccess();
      setPassword('');
    } else {
      toast({
        title: "كلمة مرور خاطئة",
        description: "يرجى التأكد من كلمة المرور والمحاولة مرة أخرى",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900/95 backdrop-blur-md border-red-500/30 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white font-bold">
            الوصول لإدارة المحتوى
          </CardTitle>
          <p className="text-gray-400 mt-2">
            يرجى إدخال كلمة المرور للمتابعة
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="admin-password" className="text-gray-300 font-medium">
                كلمة المرور
              </Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20 h-12"
                required
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || !password.trim()}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 h-12 rounded-xl shadow-lg transition-all duration-300"
              >
                {loading ? 'جارٍ التحقق...' : 'دخول'}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white h-12 rounded-xl"
                disabled={loading}
              >
                إلغاء
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-300">
                <p className="font-medium mb-1">تنبيه أمني</p>
                <p>هذه المنطقة مخصصة للمدراء فقط. يرجى عدم مشاركة كلمة المرور مع أي شخص آخر.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPasswordModal;
