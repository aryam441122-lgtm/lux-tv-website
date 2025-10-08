
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  confirmPassword: z.string().min(8, 'تأكيد كلمة المرور مطلوب')
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتان",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // Check if this is a password reset from email link
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        
        console.log('Reset password params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });

        if (accessToken && refreshToken && type === 'recovery') {
          // Set the session with the tokens from the email link
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting session:', error);
            toast({
              title: "رابط غير صالح",
              description: "رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية",
              variant: "destructive"
            });
            navigate('/login');
            return;
          }

          console.log('Session set successfully:', data);
          setIsValidSession(true);
        } else {
          // Check if user already has a valid session for password reset
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (session && !error) {
            setIsValidSession(true);
          } else {
            toast({
              title: "جلسة غير صالحة",
              description: "يجب الوصول لهذه الصفحة من خلال رابط إعادة تعيين كلمة المرور",
              variant: "destructive"
            });
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Error handling password reset:', error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء معالجة طلب إعادة تعيين كلمة المرور",
          variant: "destructive"
        });
        navigate('/login');
      } finally {
        setCheckingSession(false);
      }
    };

    handlePasswordReset();
  }, [searchParams, navigate]);

  const onSubmit = async (values: ResetPasswordForm) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });

      if (error) {
        throw error;
      }

      toast({
        title: "تم تحديث كلمة المرور",
        description: "تم تحديث كلمة المرور بنجاح. سيتم توجيهك لتسجيل الدخول"
      });

      // Sign out and redirect to login after successful password update
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "خطأ في تحديث كلمة المرور",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600/30 border-t-red-600"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-red-400 animate-pulse"></div>
          </div>
          <div className="text-white text-2xl font-semibold">جارٍ التحقق...</div>
          <div className="text-gray-400">يرجى الانتظار</div>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return null; // Component will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Button
            onClick={() => navigate('/login')}
            variant="ghost"
            className="text-white hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة لتسجيل الدخول
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent mb-2">
            LuxTV
          </h1>
          <p className="text-gray-400">إعادة تعيين كلمة المرور</p>
        </div>

        <Card className="bg-black/60 backdrop-blur-sm border-red-500/20 shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center text-white flex items-center justify-center gap-2">
              <Lock className="w-6 h-6 text-red-400" />
              كلمة مرور جديدة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">كلمة المرور الجديدة</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="أدخل كلمة المرور الجديدة"
                            className="bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">تأكيد كلمة المرور</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="أعد إدخال كلمة المرور"
                            className="bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-300"
                >
                  {loading ? "جارٍ التحديث..." : "تحديث كلمة المرور"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-400 bg-gray-800/30 p-4 rounded-xl border border-gray-700">
          <p>بعد تحديث كلمة المرور، ستحتاج إلى تسجيل الدخول مرة أخرى بكلمة المرور الجديدة</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
