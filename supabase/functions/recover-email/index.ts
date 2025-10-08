
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecoverEmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: RecoverEmailRequest = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: "بريد إلكتروني غير صالح" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Supabase client with admin privileges
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Attempting to send password reset email to:', email);

    // استخدام reset password بدلاً من email change لأنه يعمل بدون تسجيل دخول
    // سيستخدم هذا قالب "Reset Password" في Supabase Email Templates
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${new URL(req.url).origin}/change-email`
      }
    });

    if (error) {
      console.error('Error generating recovery link:', error);
      
      // في حالة الخطأ، لا نكشف التفاصيل للمستخدم لأسباب أمنية
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "إذا كان البريد الإلكتروني مسجل في النظام، فسيتم إرسال رابط التأكيد إليه"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('Recovery link generated successfully:', data);

    // دائماً نرجع رسالة نجاح لحماية خصوصية المستخدمين
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "إذا كان البريد الإلكتروني مسجل في النظام، فسيتم إرسال رابط التأكيد إليه"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in recover-email function:", error);
    return new Response(
      JSON.stringify({ error: "حدث خطأ غير متوقع" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
