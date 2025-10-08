
import { useEffect } from 'react';

const Discord = () => {
  useEffect(() => {
    // إعادة توجيه فورية إلى رابط الديسكورد
    window.location.href = 'https://discord.gg/QADHsmfVQ';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600/30 border-t-red-600"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-red-400 animate-pulse"></div>
        </div>
        <div className="text-white text-2xl font-semibold">جارٍ التحويل إلى الديسكورد...</div>
        <div className="text-gray-400">سيتم توجيهك خلال ثوانٍ</div>
        <a 
          href="https://discord.gg/QADHsmfVQ" 
          className="text-red-400 hover:text-red-300 underline"
        >
          اضغط هنا إذا لم يتم التحويل تلقائياً
        </a>
      </div>
    </div>
  );
};

export default Discord;
