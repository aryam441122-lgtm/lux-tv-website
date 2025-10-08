
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-red-900">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
          {t('notfound.title')}
        </h1>
        <p className="text-2xl text-gray-300 mb-8">{t('notfound.message')}</p>
        <Link 
          to="/" 
          className="inline-block bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          {t('notfound.return_home')}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
