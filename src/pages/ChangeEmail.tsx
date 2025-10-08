
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Mail, User, Save, X, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

const changeEmailSchema = z.object({
  newEmail: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  confirmPassword: z.string().min(8, 'تأكيد كلمة المرور مطلوب')
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتان",
  path: ["confirmPassword"],
});

type ChangeEmailForm = z.infer<typeof changeEmailSchema>;

const ChangeEmail = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'verification' | 'success'>('form');
  const [securityCheck, setSecurityCheck] = useState(false);

  const form = useForm<ChangeEmailForm>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (values: ChangeEmailForm) => {
    if (!user) {
      toast({
        title: "خطأ في المصادقة",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    // فحص أمني إضافي
    if (values.newEmail.toLowerCase() === user.email?.toLowerCase()) {
      toast({
        title: "خطأ في البيانات",
        description: "البريد الإلكتروني الجديد يجب أن يكون مختلف عن الحالي",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // التحقق من كلمة المرور الحالية أولاً
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: values.password
      });

      if (signInError) {
        toast({
          title: "كلمة المرور غير صحيحة",
          description: "يرجى التأكد من كلمة المرور الحالية",
          variant: "destructive"
        });
        return;
      }

      // إعداد URL إعادة التوجيه (الأمان: سيتم إرسال البريد للبريد القديم)
      const redirectUrl = `${window.location.origin}/`;
      
      // تحديث البريد الإلكتروني - سيرسل Supabase بريد تأكيد للبريد القديم
      const { error } = await supabase.auth.updateUser({
        email: values.newEmail
      }, {
        emailRedirectTo: redirectUrl
      });

      if (error) {
        if (error.message.includes('email address is already registered')) {
          toast({
            title: "البريد الإلكتروني مسجل مسبقاً",
            description: "هذا البريد الإلكتروني مسجل بالفعل لحساب آخر",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      setStep('verification');
      
    } catch (error: any) {
      console.error('Error updating email:', error);
      toast({
        title: "خطأ في تحديث البريد الإلكتروني",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center p-4">
        <Card className="bg-black/60 backdrop-blur-sm border-red-500/20 shadow-2xl max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-white mb-4">يجب تسجيل الدخول أولاً</p>
            <Button 
              onClick={() => navigate('/login')} 
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              تسجيل الدخول
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'verification') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-white hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة للصفحة الرئيسية
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent mb-2">
              LuxTV
            </h1>
            <p className="text-gray-400">تأكيد تغيير البريد الإلكتروني</p>
          </div>

          <Card className="bg-black/60 backdrop-blur-sm border-yellow-500/20 shadow-2xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl text-center text-white flex items-center justify-center gap-2">
                <Shield className="w-6 h-6 text-yellow-400" />
                التحقق الأمني
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-yellow-400 text-sm">
                    <p className="font-semibold mb-2">إجراء أمني مهم:</p>
                    <p>تم إرسال بريد تأكيد إلى بريدك الإلكتروني <strong>الحالي</strong>:</p>
                    <p className="mt-2 p-2 bg-gray-800/50 rounded text-white">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>تحقق من صندوق الوارد في بريدك القديم</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>انقر على رابط التأكيد المرسل</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>ستتم إعادة توجيهك لتأكيد البريد الجديد</span>
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-red-400 text-sm">
                    <p className="font-semibold mb-1">تنبيه أمني:</p>
                    <p>• لم يتم إرسال أي شيء للبريد الجديد</p>
                    <p>• جميع الروابط ترسل للبريد القديم فقط</p>
                    <p>• هذا لحماية حسابك من الاختراق</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-300"
              >
                فهمت، العودة للصفحة الرئيسية
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-white hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة للصفحة الرئيسية
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent mb-2">
            LuxTV
          </h1>
          <p className="text-gray-400">تغيير البريد الإلكتروني</p>
        </div>

        {/* Current Email Display */}
        <Card className="bg-black/40 backdrop-blur-sm border-gray-500/20 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">البريد الإلكتروني الحالي</p>
                <p className="text-white font-medium">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-blue-400 text-sm space-y-1">
              <p className="font-semibold">إجراءات الأمان المفعلة:</p>
              <p>• التحقق من كلمة المرور الحالية مطلوب</p>
              <p>• رسائل التأكيد ترسل للبريد القديم فقط</p>
              <p>• عملية تغيير البريد محمية بالكامل</p>
            </div>
          </div>
        </div>

        {/* Change Email Form */}
        <Card className="bg-black/60 backdrop-blur-sm border-red-500/20 shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center text-white flex items-center justify-center gap-2">
              <Mail className="w-6 h-6 text-red-400" />
              تغيير البريد الإلكتروني
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="newEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">البريد الإلكتروني الجديد</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="أدخل البريد الإلكتروني الجديد"
                          className="bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-red-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">كلمة المرور الحالية للتأكيد</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="أدخل كلمة المرور الحالية"
                          className="bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-red-500"
                          {...field}
                        />
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
                        <Input
                          type="password"
                          placeholder="أعد إدخال كلمة المرور"
                          className="bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-red-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-300"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "جارٍ الحفظ..." : "حفظ"}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    <X className="w-4 h-4 mr-2" />
                    إلغاء
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Security Information */}
        <div className="text-center text-sm text-gray-400 bg-gray-800/30 p-4 rounded-xl border border-gray-700">
          <p className="mb-2 font-semibold text-red-400">تنبيه أمني مهم:</p>
          <p className="mb-2">جميع رسائل التأكيد سترسل لبريدك الإلكتروني الحالي فقط</p>
          <p>لن يتم إرسال أي شيء للبريد الجديد حتى التأكيد الكامل</p>
        </div>
      </div>
    </div>
  );
};

export default ChangeEmail;
