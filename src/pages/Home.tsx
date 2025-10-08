
import React, { useState, useEffect } from 'react';
import { 
  Play, Star, Users, Globe, Shield, Zap, Award, 
  Download, Heart, CheckCircle, ArrowRight, 
  Sparkles, Film, Gift, ChevronDown, Eye, 
  TrendingUp, Clock, Music, Infinity, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const homeTranslations = {
    ar: {
      'home.hero.title': 'أكبر منصة افلام ومسلسلات مجانية',
      'home.hero.subtitle': 'اكتشف عالماً لا نهائياً من الأفلام والمسلسلات العربية والعالمية وبدون إعلانات',
      'home.hero.cta': 'ابدأ المشاهدة',
      'home.hero.free': 'مجاناً',
      'home.stats.content': 'محتوى حصري',
      'home.stats.users': 'مستخدم نشط يومياً',
      'home.stats.countries': 'دولة',
      'home.stats.rating': 'تقييم المنصة',
      'home.features.title': 'تقنيات المستقبل',
      'home.features.ai': 'ذكاء اصطناعي',
      'home.features.ai.desc': 'توصيات مخصصة تتعلم من تفضيلاتك',
      'home.features.quality': 'جودة فائقة',
      'home.features.quality.desc': '4K HDR مع صوت مكاني ثلاثي الأبعاد',
      'home.features.sync': 'تزامن ذكي',
      'home.features.sync.desc': 'تابع من حيث توقفت عبر جميع الأجهزة',
      'home.features.live': 'بث مباشر',
      'home.features.live.desc': 'أحداث حية وعروض أولى حصرية',
      'home.features.social': 'تجربة اجتماعية',
      'home.features.social.desc': 'شاهد مع الأصدقاء واستمتع بالدردشة',
      'home.features.offline': 'مشاهدة بلا حدود',
      'home.features.offline.desc': 'حمل واستمتع في أي مكان وزمان',
      'home.content.title': 'مكتبة لا متناهية',
      'home.content.original': 'إنتاجات أصلية',
      'home.content.blockbuster': 'أفلام عالمية',
      'home.content.series': 'مسلسلات حصرية',
      'home.content.documentary': 'وثائقيات مميزة',
      'home.testimonials.title': 'ما يقوله المستخدمون',
      'home.faq.title': 'الأسئلة الشائعة',
      'home.faq.free.q': 'هل الخدمة مجانية حقاً؟',
      'home.faq.free.a': 'نعم، نقدم مكتبة كاملة من الافلام والمسلسلات الحصرية مجاناً مع تجربة خالية من الإعلانات المزعجة.',
      'home.faq.quality.q': 'ما هي أعلى جودة متاحة؟',
      'home.faq.quality.a': 'نوفر جودة تصل إلى 4K Ultra HD مع تقنية HDR المتقدمة وصوت مكاني ثلاثي الأبعاد للتجربة الأمثل.',
      'home.faq.devices.q': 'على أي أجهزة يمكنني المشاهدة؟',
      'home.faq.devices.a': 'منصتنا متوافقة مع جميع الأجهزة: الهواتف الذكية، الأجهزة اللوحية، أجهزة الكمبيوتر، التلفزيونات الذكية، وأجهزة الألعاب.',
      'home.faq.content.q': 'كم المحتوى المتاح؟',
      'home.faq.content.a': 'لدينا أكثر من 100,000 ساعة من المحتوى المتنوع: أفلام، مسلسلات، وإنتاجات أصلية حصرية من جميع أنحاء العالم.',
      'home.cta.title': 'انضم لـ LuxTv حيث الافلام والمسلسلات',
      'home.cta.subtitle': 'ابدأ رحلتك في عالم من الافلام والمسلسلات الحصرية اليوم'
    },
    en: {
      'home.hero.title': 'The Future of Visual Entertainment',
      'home.hero.subtitle': 'Discover an infinite world of Arabic and international movies and series in 4K quality without ads',
      'home.hero.cta': 'Start Watching',
      'home.hero.free': 'Free Forever',
      'home.stats.content': 'Exclusive Content',
      'home.stats.users': 'Active Users Every Day',
      'home.stats.countries': 'Countries',
      'home.stats.rating': 'Platform Rating',
      'home.features.title': 'Future Technologies',
      'home.features.ai': 'AI Powered',
      'home.features.ai.desc': 'Personalized recommendations that learn your preferences',
      'home.features.quality': 'Ultra Quality',
      'home.features.quality.desc': '4K HDR with spatial 3D audio',
      'home.features.sync': 'Smart Sync',
      'home.features.sync.desc': 'Continue where you left off across all devices',
      'home.features.live': 'Live Streaming',
      'home.features.live.desc': 'Live events and exclusive premieres',
      'home.features.social': 'Social Experience',
      'home.features.social.desc': 'Watch with friends and enjoy chat',
      'home.features.offline': 'Unlimited Viewing',
      'home.features.offline.desc': 'Download and enjoy anywhere, anytime',
      'home.content.title': 'Infinite Library',
      'home.content.original': 'Original Productions',
      'home.content.blockbuster': 'Global Movies',
      'home.content.series': 'Exclusive Series',
      'home.content.documentary': 'Premium Documentaries',
      'home.testimonials.title': 'What Users Say',
      'home.faq.title': 'Frequently Asked Questions',
      'home.faq.free.q': 'Is the service really free?',
      'home.faq.free.a': 'Yes, we provide a complete library of premium content for free with an ad-free experience.',
      'home.faq.quality.q': 'What is the highest quality available?',
      'home.faq.quality.a': 'We offer up to 4K Ultra HD quality with advanced HDR technology and spatial 3D audio for the optimal experience.',
      'home.faq.devices.q': 'On which devices can I watch?',
      'home.faq.devices.a': 'Our platform is compatible with all devices: smartphones, tablets, computers, smart TVs, and gaming consoles.',
      'home.faq.content.q': 'How much content is available?',
      'home.faq.content.a': 'We have over 100,000 hours of diverse content: movies, series, documentaries, and exclusive original productions from around the world.',
      'home.cta.title': 'Join the Entertainment Revolution',
      'home.cta.subtitle': 'Start your journey in the world of infinite content today'
    }
  };

  const currentTranslations = homeTranslations[language] || homeTranslations.en;
  const tHome = (key: string) => currentTranslations[key] || key;

  const features = [
    { icon: Crown, key: 'ai', gradient: 'from-purple-500 via-pink-500 to-red-500' },
    { icon: Award, key: 'quality', gradient: 'from-blue-500 via-cyan-500 to-teal-500' },
    { icon: Zap, key: 'sync', gradient: 'from-yellow-500 via-orange-500 to-red-500' },
    { icon: Play, key: 'live', gradient: 'from-green-500 via-emerald-500 to-teal-500' },
    { icon: Users, key: 'social', gradient: 'from-indigo-500 via-purple-500 to-pink-500' },
    { icon: Infinity, key: 'offline', gradient: 'from-rose-500 via-pink-500 to-purple-500' }
  ];

  const contentTypes = [
    { icon: Crown, key: 'original', gradient: 'from-amber-500 to-orange-600' },
    { icon: Film, key: 'blockbuster', gradient: 'from-red-500 to-pink-600' },
    { icon: TrendingUp, key: 'series', gradient: 'from-blue-500 to-cyan-600' },
    { icon: Eye, key: 'documentary', gradient: 'from-green-500 to-emerald-600' }
  ];

  const faqItems = [
    { key: 'free', icon: Gift },
    { key: 'quality', icon: Award },
    { key: 'devices', icon: Users },
    { key: 'content', icon: Film }
  ];

  const testimonials = [
    { name: 'أبو عزيز', rating: 4, text: 'من زمان وانا أدور شي زي كذا أفلام بدون إعلانات تقرفك رهيب والله' },
    { name: 'نوف الحربي', rating: 5, text: 'أقسم بالله ارتحت من سالفة الإعلانات! أدخل أتفرج واطلع مبسوطة' },
    { name: 'تركي العمري', rating: 3, text: 'فيه مسلسلات حلوة بس ناقصه شوية تحديثات بس الفكرة ممتازة' },
    { name: 'مها الدوسري', rating: 5, text: 'أحسن موقع شفته من ناحية ترتيب وسرعة وكلشي لا إعلانات ولا دوشة' },
    { name: 'خالد التميمي', rating: 2, text: 'الصراحة توقعت أفضل شوي بس الفكرة حلوة وممكن تتحسن مع الوقت' },
    { name: 'شوق', rating: 4, text: 'أتابع مسلسلاتي المفضلة بدون ما يقطعني إعلان كل شوي عجبني والله' },
    { name: 'أبو نهيّل', rating: 5, text: 'تشغيل سريع وجودة ممتازة كأنك فاتح نتفلكس بس بدون زحمة وإعلانات' },
    { name: 'لولوة', rating: 3, text: 'الموقع حلو بس ناقصه كم مسلسل كنت أدور عليهم بس بشكل عام ممتاز' },
    { name: 'فهد الشمري', rating: 4, text: 'أفلام جديدة تشتغل على طول وبدون إعلانات؟ والله شي يحترم' },
    { name: 'العنود', rating: 5, text: 'أول مرة ألقى موقع أفلام كذا مرتب ونظيف استمرو يا أبطال' },
    { name: 'بندر', rating: 2, text: 'كان يعلق معي أحيان بس الصراحة يستاهل التجربة' },
    { name: 'شيخة نجد', rating: 5, text: 'أشغل الفيلم وأنسى الدنيا لا إعلانات ولا تهنيق رهيب مره' }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black text-white overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.12),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,100,100,0.12),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(168,85,247,0.08),transparent_50%)]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 z-10">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        ></div>
        
        <div className="relative z-20 text-center max-w-7xl mx-auto space-y-12">
          {/* Logo */}
          <div className="group cursor-pointer">
            <div className="mx-auto w-32 h-32 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-3xl flex items-center justify-center transform transition-all duration-700 hover:scale-110 hover:rotate-3 shadow-2xl shadow-purple-500/30">
              <div className="w-24 h-24 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                <span className="text-3xl font-black text-white">LUX TV</span>
              </div>
            </div>
          </div>

          {/* Main Title */}
          <div className="space-y-8">
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                {tHome('home.hero.title')}
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-300 max-w-5xl mx-auto leading-relaxed">
              {tHome('home.hero.subtitle')}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Button
              onClick={() => navigate('/')}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white text-2xl font-bold px-16 py-8 rounded-2xl transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Play className={`w-8 h-8 ${isRTL ? 'ml-4' : 'mr-4'} relative z-10`} />
              {tHome('home.hero.cta')}
              <ArrowRight className={`w-8 h-8 ${isRTL ? 'mr-4' : 'ml-4'} relative z-10 group-hover:translate-x-2 transition-transform duration-300`} />
            </Button>
            
            <div className="relative overflow-hidden bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-xl text-green-300 px-10 py-6 text-xl font-bold border border-green-500/30 rounded-2xl transition-all duration-500 hover:scale-105 hover:bg-green-600/30">
              <Gift className={`w-6 h-6 ${isRTL ? 'ml-3' : 'mr-3'} inline-block`} />
              {tHome('home.hero.free')}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '100K+', label: tHome('home.stats.content'), icon: Crown },
              { number: '70K+', label: tHome('home.stats.users'), icon: Users },
              { number: '195+', label: tHome('home.stats.countries'), icon: Globe },
              { number: '4.9★', label: tHome('home.stats.rating'), icon: Star }
            ].map((stat, index) => (
              <div
                key={index}
                className="group relative overflow-hidden p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 transition-all duration-500 hover:scale-105 hover:bg-white/15 hover:border-white/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <stat.icon className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 group-hover:text-pink-400 transition-all duration-300" />
                <div className="text-3xl font-black text-white mb-2">{stat.number}</div>
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-6xl font-black mb-8">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                {tHome('home.features.title')}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.key}
                className="group relative overflow-hidden p-10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 transition-all duration-700 hover:scale-105 hover:bg-white/15"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-700`}></div>
                
                <div className="relative z-10">
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors duration-300">
                    {tHome(`home.features.${feature.key}`)}
                  </h3>
                  
                  <p className="text-gray-400 text-lg leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {tHome(`home.features.${feature.key}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Showcase */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-6xl font-black mb-8">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                {tHome('home.content.title')}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contentTypes.map((content, index) => (
              <div
                key={content.key}
                className={`group relative overflow-hidden p-12 bg-gradient-to-br ${content.gradient} rounded-3xl text-center transition-all duration-700 hover:scale-110 hover:rotate-2`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <content.icon className="w-16 h-16 text-white mx-auto mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" />
                <h3 className="text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
                  {tHome(`home.content.${content.key}`)}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-6xl font-black mb-8">
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {tHome('home.testimonials.title')}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group relative overflow-hidden p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 transition-all duration-500 hover:scale-105 hover:bg-white/15"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed group-hover:text-white transition-colors duration-300">
                  {testimonial.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-6xl font-black mb-8">
              <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                {tHome('home.faq.title')}
              </span>
            </h2>
          </div>

          <div className="space-y-6">
            {faqItems.map((faq, index) => (
              <div
                key={faq.key}
                className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 transition-all duration-500 hover:bg-white/15"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-8 text-left flex items-center justify-between transition-all duration-300"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <faq.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
                      {tHome(`home.faq.${faq.key}.q`)}
                    </h3>
                  </div>
                  <ChevronDown 
                    className={`w-8 h-8 text-gray-400 transition-all duration-300 ${openFaq === index ? 'rotate-180 text-purple-400' : 'group-hover:text-white'}`} 
                  />
                </button>
                
                <div className={`overflow-hidden transition-all duration-500 ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-8 pb-8">
                    <div className="pl-20 bg-gradient-to-r from-white/5 to-transparent p-6 rounded-2xl">
                      <p className="text-gray-300 text-xl leading-relaxed">
                        {tHome(`home.faq.${faq.key}.a`)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="relative overflow-hidden p-16 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-red-600/20 backdrop-blur-2xl rounded-3xl border border-white/30 transition-all duration-700 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 animate-pulse"></div>
            
            <Sparkles className="w-20 h-20 text-purple-400 mx-auto mb-8 animate-spin" />
            
            <h2 className="text-4xl sm:text-6xl font-black mb-8">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                {tHome('home.cta.title')}
              </span>
            </h2>
            
            <p className="text-2xl text-gray-300 mb-12 leading-relaxed">
              {tHome('home.cta.subtitle')}
            </p>
            
            <Button
              onClick={() => navigate('/')}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white text-3xl font-bold px-20 py-10 rounded-2xl transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/40"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Play className={`w-10 h-10 ${isRTL ? 'ml-6' : 'mr-6'} relative z-10`} />
              {tHome('home.hero.cta')}
              <ArrowRight className={`w-10 h-10 ${isRTL ? 'mr-6' : 'ml-6'} relative z-10 group-hover:translate-x-3 transition-transform duration-300`} />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Spacer */}
      <div className="h-20"></div>
    </div>
  );
};

export default Home;
