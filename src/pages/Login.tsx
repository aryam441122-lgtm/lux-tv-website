
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, UserPlus, LogIn, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';

const Login = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const { t, language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  // Create schemas with dynamic validation messages
  const loginSchema = z.object({
    email: z.string().email(t('error.invalid_email')),
    password: z.string().min(6, t('error.password_min_length'))
  });

  const signupSchema = z.object({
    email: z.string().email(t('error.invalid_email')),
    password: z.string().min(6, t('error.password_min_length')),
    confirmPassword: z.string().min(6, t('error.confirm_password_required'))
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('error.passwords_not_match'),
    path: ["confirmPassword"],
  });

  const resetPasswordSchema = z.object({
    email: z.string().email(t('error.invalid_email'))
  });

  type LoginForm = z.infer<typeof loginSchema>;
  type SignupForm = z.infer<typeof signupSchema>;
  type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const resetForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onLogin = async (values: LoginForm) => {
    setLoading(true);
    try {
      const { error } = await signIn(values.email, values.password);
      if (error) {
        toast({
          title: t('error.login_failed'),
          description: error.message === 'Invalid login credentials' 
            ? t('error.invalid_credentials')
            : error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: t('error.login_failed'),
        description: t('error.unexpected'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async (values: SignupForm) => {
    setLoading(true);
    try {
      const { error } = await signUp(values.email, values.password);
      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: t('error.user_exists'),
            description: t('error.user_exists_desc'),
            variant: "destructive"
          });
        } else {
          toast({
            title: t('error.signup_failed'),
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: t('success.account_created'),
          description: t('success.account_created_desc')
        });
        signupForm.reset();
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: t('error.signup_failed'),
        description: t('error.unexpected'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (values: ResetPasswordForm) => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: redirectUrl
      });

      if (error) {
        throw error;
      }

      toast({
        title: t('success.reset_link_sent'),
        description: t('success.reset_link_sent_desc')
      });
      
      setShowResetForm(false);
      resetForm.reset();
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        title: t('error.reset_password_failed'),
        description: error.message || t('error.unexpected'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (showResetForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="absolute top-4 right-4">
            <LanguageToggle />
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent mb-2">
              {t('site.title')}
            </h1>
            <p className="text-gray-400">{t('auth.reset_password')}</p>
          </div>

          <Card className="bg-black/60 backdrop-blur-sm border-red-500/20 shadow-2xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl text-center text-white flex items-center justify-center gap-2">
                <Lock className="w-6 h-6 text-red-400" />
                {t('auth.reset_password_title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4">
                  <FormField
                    control={resetForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">{t('auth.email')}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t('auth.enter_email')}
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
                      {loading ? t('auth.sending') : t('auth.send_reset_link')}
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={() => setShowResetForm(false)}
                      variant="outline"
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white py-3 rounded-xl font-semibold transition-all duration-300"
                    >
                      {t('auth.cancel')}
                    </Button>
                  </div>
                </form>
              </Form>

              <div className="mt-6 pt-4 border-t border-gray-600">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => navigate('/forgot-email')}
                  className="w-full text-blue-400 hover:text-blue-300 p-0 h-auto text-sm flex items-center justify-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  {t('auth.forgot_email_help')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="absolute top-4 right-4">
          <LanguageToggle />
        </div>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent mb-2">
            {t('site.title')}
          </h1>
          <p className="text-gray-400">{t('auth.welcome')}</p>
        </div>

        <Card className="bg-black/60 backdrop-blur-sm border-red-500/20 shadow-2xl">
          <CardContent className="p-0">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border-b border-red-500/20">
                <TabsTrigger 
                  value="login" 
                  className="text-gray-400 data-[state=active]:text-white data-[state=active]:bg-red-600/20 data-[state=active]:border-red-500 transition-all duration-300"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {t('auth.login')}
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="text-gray-400 data-[state=active]:text-white data-[state=active]:bg-red-600/20 data-[state=active]:border-red-500 transition-all duration-300"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('auth.signup')}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="p-6 space-y-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">{t('auth.email')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                              <Input
                                type="email"
                                placeholder={t('auth.enter_email')}
                                className={`bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 ${language === 'ar' ? 'pr-10' : 'pl-10'}`}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">{t('auth.password')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder={t('auth.enter_password')}
                                className={`bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 ${language === 'ar' ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={`absolute ${language === 'ar' ? 'left-2' : 'right-2'} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white`}
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

                    <div className="flex justify-between items-center">
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setShowResetForm(true)}
                        className="text-red-400 hover:text-red-300 p-0 h-auto text-sm"
                      >
                        {t('auth.forgot_password')}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => navigate('/forgot-email')}
                        className="text-blue-400 hover:text-blue-300 p-0 h-auto text-sm flex items-center gap-1"
                      >
                        <HelpCircle className="w-3 h-3" />
                        {t('auth.forgot_email')}
                      </Button>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-300"
                    >
                      {loading ? t('auth.logging_in') : t('auth.login')}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="signup" className="p-6 space-y-4">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">{t('auth.email')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                              <Input
                                type="email"
                                placeholder={t('auth.enter_email')}
                                className={`bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 ${language === 'ar' ? 'pr-10' : 'pl-10'}`}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">{t('auth.password')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder={t('auth.enter_password')}
                                className={`bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 ${language === 'ar' ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={`absolute ${language === 'ar' ? 'left-2' : 'right-2'} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white`}
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
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">{t('auth.confirm_password')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder={t('auth.confirm_password_placeholder')}
                                className={`bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 ${language === 'ar' ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={`absolute ${language === 'ar' ? 'left-2' : 'right-2'} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white`}
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
                      {loading ? t('auth.creating_account') : t('auth.create_new_account')}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-400">
          <p>{t('auth.terms')}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
