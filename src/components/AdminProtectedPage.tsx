
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminProtectedPageProps {
  children: React.ReactNode;
}

const AdminProtectedPage = ({ children }: AdminProtectedPageProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Check exact password match
    if (password === '7YqqJkm3km1UdrwsGK3c') {
      toast({
        title: "تم التحقق بنجاح",
        description: "مرحباً بك في لوحة إدارة المحتوى"
      });
      
      // Start fade out animation
      setShowModal(false);
      
      // Set authenticated after animation completes
      setTimeout(() => {
        setIsAuthenticated(true);
        setPassword('');
      }, 500);
    } else {
      toast({
        title: "كلمة مرور خاطئة",
        description: "يرجى التأكد من كلمة المرور والمحاولة مرة أخرى",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center p-4 relative">
      {/* Backdrop blur overlay */}
      <div className="absolute inset-0 backdrop-blur-xl bg-black/60" />
      
      {/* Admin Password Modal */}
      <div 
        className={`relative z-10 transform transition-all duration-500 ease-out ${
          showModal 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        <Card className="w-full max-w-md bg-gray-900/95 backdrop-blur-md border-red-500/30 shadow-2xl animate-fade-in">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center animate-pulse">
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
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20 h-12 transition-all duration-300"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading || !password.trim()}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 h-12 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                      <span>جارٍ التحقق...</span>
                    </div>
                  ) : (
                    'دخول'
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg animate-fade-in">
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
    </div>
  );
};

export default AdminProtectedPage;
