
import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 9 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4000);

    // Complete after 10 seconds
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background gradient animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-900/20 to-black animate-pulse"></div>
      
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-red-500/30 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center">
        {/* Animated logo */}
        <div className="mb-12 transform transition-all duration-2000 animate-pulse">
          <div className="w-32 h-32 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-2xl mx-auto mb-8 animate-bounce">
            <span className="text-6xl font-bold text-white animate-pulse">LUX</span>
          </div>
        </div>

        {/* Animated title */}
        <div className="overflow-hidden mb-12">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-red-500 via-red-400 to-red-600 bg-clip-text text-transparent animate-pulse transform transition-all duration-1000">
            {['L', 'u', 'x', 'T', 'V'].map((letter, index) => (
              <span
                key={index}
                className="inline-block animate-bounce"
                style={{
                  animationDelay: `${index * 0.2}s`,
                  animationDuration: '2s'
                }}
              >
                {letter}
              </span>
            ))}
          </h1>
        </div>

        {/* Loading text with typewriter effect */}
        <div className="text-2xl text-white font-medium mb-8 animate-pulse">
          <div className="flex items-center justify-center space-x-2">
            <span>جارٍ التحميل</span>
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                  style={{
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: '1.5s'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-80 h-2 bg-gray-800 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full animate-pulse transform origin-left">
            <div className="w-full h-full bg-gradient-to-r from-red-600 to-red-400 animate-loading"></div>
          </div>
        </div>

        {/* Welcome message */}
        <p className="text-lg text-gray-300 mt-8 animate-fade-in">
          استمتع بمشاهدة آلاف الأفلام والمسلسلات
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
