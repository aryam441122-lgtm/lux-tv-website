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
import { ArrowLeft, Mail, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

const forgotEmailSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح')
});

type ForgotEmailForm = z.infer<typeof forgotEmailSchema>;

const ForgotEmail = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'success'>('input');
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  const form = useForm<ForgotEmailForm>({
    resolver: zodResolver(forgotEmailSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (values: ForgotEmailForm) => {
    if (attempts >= maxAttempts) {
      toast({
        title: "تم حظر المحاولات",
        description: "تم تجاوز الحد الأقصى للمحاولات. يرجى المحاولة لاحقاً",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setAttempts(prev => prev + 1);
    
    try {
      console.log('Sending email change request for:', values.email);
      
      // استخدام Edge Function لإرسال رسالة تغيير البريد الإلكتروني
      const { data, error } = await supabase.functions.invoke('recover-email', {
        body: { email: values.email }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Error invoking recover-email function:', error);
        toast({
          title: "خطأ في الإرسال",
          description: "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "تم الإرسال بنجاح",
        description: "إذا كان البريد الإلكتروني مسجل في النظام، فسيتم إرسال رابط التأكيد إليه"
      });
      
      setStep('success');
      
    } catch (error: any) {
      console.error('Error in email recovery:', error);
      toast({
        title: "خطأ في الإرسال",
        description: "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
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
            <p className="text-gray-400">تم إرسال رابط التأكيد</p>
          </div>

          <Card className="bg-black/60 backdrop-blur-sm border-green-500/20 shadow-2xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl text-center text-white flex items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                تم الإرسال بنجاح
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4">
                  <p className="text-green-400 text-sm">
                    إذا كان البريد الإلكتروني مسجل في النظام، فسيتم إرسال رابط تأكيد تغيير البريد إليه
                  </p>
                </div>
                
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• تحقق من صندوق الوارد وصندوق الرسائل غير المرغوب فيها</p>
                  <p>• الرابط صالح لمدة محدودة فقط</p>
                  <p>• سيتم توجيهك لصفحة تغيير البريد الإلكتروني</p>
                  <p>• لا تشارك الرابط مع أي شخص آخر</p>
                </div>
              </div>

              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-300"
              >
                العودة لتسجيل الدخول
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
          <p className="text-gray-400">استرداد البريد الإلكتروني</p>
        </div>

        <Card className="bg-black/60 backdrop-blur-sm border-red-500/20 shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center text-white flex items-center justify-center gap-2">
              <Mail className="w-6 h-6 text-red-400" />
              نسيت البريد الإلكتروني؟
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attempts >= maxAttempts ? (
              <div className="text-center space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-red-400 text-sm">
                    تم تجاوز الحد الأقصى للمحاولات. يرجى المحاولة بعد 30 دقيقة
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  العودة لتسجيل الدخول
                </Button>
              </div>
            ) : (
              <>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-blue-400 text-sm space-y-1">
                      <p className="font-semibold">إجراءات الأمان:</p>
                      <p>• سيتم إرسال رابط التأكيد للبريد المسجل فقط</p>
                      <p>• المحاولات محدودة لمنع الاختراق</p>
                      <p>• جميع العمليات مشفرة ومحمية</p>
                      <p>• سيتم توجيهك لصفحة تغيير البريد الإلكتروني</p>
                    </div>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="أدخل بريدك الإلكتروني"
                              className="bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-red-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <div className="text-xs text-gray-400 bg-gray-800/30 p-3 rounded-lg">
                      <p>المحاولات المتبقية: {maxAttempts - attempts} من {maxAttempts}</p>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-300"
                    >
                      {loading ? "جارٍ الإرسال..." : "إرسال رابط التأكيد"}
                    </Button>
                  </form>
                </Form>
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-400 bg-gray-800/30 p-4 rounded-xl border border-gray-700">
          <p className="mb-2">لحماية حسابك:</p>
          <p>• سيتم إرسال رابط التأكيد للبريد المسجل فقط</p>
          <p>• لن يتم الكشف عن وجود البريد الإلكتروني لأسباب أمنية</p>
          <p>• سيتم توجيهك لصفحة تغيير البريد الإلكتروني للمتابعة</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotEmail;
