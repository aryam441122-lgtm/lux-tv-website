
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
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, User, Settings as SettingsIcon, Key, Mail, Save, Shield, Home } from 'lucide-react';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8, 'كلمة المرور الحالية يجب أن تكون 8 أحرف على الأقل'),
  newPassword: z.string().min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'),
  confirmPassword: z.string().min(8, 'تأكيد كلمة المرور مطلوب')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتان",
  path: ["confirmPassword"],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

const Settings = () => {
  const navigate = useNavigate();
  const { user, selectedProfile, loading } = useAuth();
  const { t, isRTL } = useLanguage();
  const [activeSection, setActiveSection] = useState<'profile' | 'password' | 'email'>('profile');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  // Redirect if not logged in
  if (!user || !selectedProfile) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600/30 border-t-red-600"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-red-400 animate-pulse"></div>
          </div>
          <div className="text-white text-2xl font-semibold">جارٍ التحميل...</div>
        </div>
      </div>
    );
  }

  const onSubmit = async (values: ChangePasswordForm) => {
    setPasswordLoading(true);
    
    try {
      // التحقق من كلمة المرور الحالية أولاً
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: values.currentPassword
      });

      if (signInError) {
        toast({
          title: "كلمة المرور الحالية غير صحيحة",
          description: "يرجى التأكد من كلمة المرور الحالية",
          variant: "destructive"
        });
        return;
      }

      // تحديث كلمة المرور
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword
      });

      if (error) {
        throw error;
      }

      toast({
        title: "تم تحديث كلمة المرور بنجاح",
        description: "تم تغيير كلمة المرور وتسجيل الخروج من الأجهزة الأخرى",
      });

      form.reset();
      setActiveSection('profile');
      
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "خطأ في تحديث كلمة المرور",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const menuItems = [
    { id: 'profile', label: 'الإعدادات', icon: SettingsIcon },
    { id: 'password', label: 'تغيير كلمة المرور', icon: Key },
    { id: 'email', label: 'تغيير بريدك الإلكتروني', icon: Mail },
  ];

  const handleEmailChange = () => {
    navigate('/change-email');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="bg-black/95 backdrop-blur-xl border-b border-red-500/30 shadow-2xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="text-white hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
              >
                <ArrowLeft className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                العودة للصفحة الرئيسية
              </Button>
            </div>
            
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-xl flex items-center justify-center shadow-xl">
                <span className="text-lg font-black text-white tracking-wider">LUX</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent tracking-wide">
                  إعدادات الحساب
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <Card className="lg:w-1/4 bg-black/60 backdrop-blur-sm border-red-500/20 shadow-2xl">
            <CardContent className="p-6">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as any)}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    className={`w-full justify-start transition-all duration-300 ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-red-500/20'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="transition-all duration-500 ease-in-out">
              {activeSection === 'profile' && (
                <Card className="bg-black/60 backdrop-blur-sm border-red-500/20 shadow-2xl animate-fade-in">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white flex items-center gap-3">
                      <User className="w-6 h-6 text-red-400" />
                      مرحباً بك في إعدادات حسابك
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Info */}
                    <div className="flex items-center space-x-6 space-x-reverse bg-gray-800/50 rounded-2xl p-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-xl">
                        <User className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">{selectedProfile.name}</h3>
                        <p className="text-gray-300 text-lg mb-1">{user.email}</p>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm font-medium">حساب محقق</span>
                        </div>
                      </div>
                    </div>

                    {/* Welcome Message */}
                    <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 rounded-2xl p-6">
                      <h4 className="text-xl font-bold text-white mb-3">مرحباً {selectedProfile.name}!</h4>
                      <p className="text-gray-300 leading-relaxed">
                        نحن سعداء لرؤيتك هنا. يمكنك من خلال هذه الصفحة إدارة إعدادات حسابك وتحديث معلوماتك الشخصية.
                        اختر من القائمة الجانبية ما تريد تعديله.
                      </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-800/50 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <Home className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-sm text-gray-400">منذ انضمامك</p>
                            <p className="text-white font-semibold">
                              {new Date(selectedProfile.created_at).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-800/50 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-green-400" />
                          <div>
                            <p className="text-sm text-gray-400">نوع الحساب</p>
                            <p className="text-white font-semibold">
                              {selectedProfile.is_adult ? 'حساب بالغ' : 'حساب عادي'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeSection === 'password' && (
                <Card className="bg-black/60 backdrop-blur-sm border-red-500/20 shadow-2xl animate-fade-in">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white flex items-center gap-3">
                      <Key className="w-6 h-6 text-red-400" />
                      تغيير كلمة المرور
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
                        <div className="text-yellow-400 text-sm">
                          <p className="font-semibold mb-1">تنبيه أمني:</p>
                          <p>عند تغيير كلمة المرور، سيتم تسجيل الخروج من جميع الأجهزة الأخرى تلقائياً لحماية حسابك.</p>
                        </div>
                      </div>
                    </div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">كلمة المرور الحالية</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="أدخل كلمة المرور الحالية"
                                  className="bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 h-12"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">كلمة المرور الجديدة</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="أدخل كلمة المرور الجديدة"
                                  className="bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 h-12"
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
                              <FormLabel className="text-gray-300">تأكيد كلمة المرور الجديدة</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="أعد إدخال كلمة المرور الجديدة"
                                  className="bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 h-12"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-4 pt-4">
                          <Button
                            type="submit"
                            disabled={passwordLoading}
                            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-300"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {passwordLoading ? "جارٍ الحفظ..." : "حفظ كلمة المرور الجديدة"}
                          </Button>
                          
                          <Button
                            type="button"
                            onClick={() => {
                              form.reset();
                              setActiveSection('profile');
                            }}
                            variant="outline"
                            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white py-3 rounded-xl font-semibold transition-all duration-300"
                          >
                            إلغاء
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {activeSection === 'email' && (
                <Card className="bg-black/60 backdrop-blur-sm border-red-500/20 shadow-2xl animate-fade-in">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white flex items-center gap-3">
                      <Mail className="w-6 h-6 text-red-400" />
                      تغيير البريد الإلكتروني
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <Mail className="w-6 h-6 text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="text-blue-400 font-semibold mb-2">البريد الإلكتروني الحالي</h4>
                          <p className="text-white text-lg font-medium">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
                        <div className="text-yellow-400 text-sm">
                          <p className="font-semibold mb-1">إجراءات الأمان:</p>
                          <p>لتغيير بريدك الإلكتروني، ستحتاج إلى تأكيد العملية عبر بريدك الحالي لضمان الأمان.</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleEmailChange}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-300"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      الانتقال إلى صفحة تغيير البريد الإلكتروني
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
