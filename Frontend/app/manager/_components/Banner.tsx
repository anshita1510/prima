"use client"
import React, { useEffect, useState } from 'react';

const Banner: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imageUrl = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&auto=format&fit=crop&q=80";

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="w-full p-6 pt-20 lg:pt-6 bg-gray-50 flex items-start justify-center">
      <div className="relative w-full max-w-6xl h-[160px] md:h-[220px] overflow-hidden bg-blue-950 shadow-md rounded-2xl group">
        
        {/* Background Image */}
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-3000 ease-out ${
            isLoaded ? 'scale-100' : 'scale-110'
          }`}
          style={{ backgroundImage: `url('${imageUrl}')` }}
        />
        
        {/* Blue Opacity Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/60 to-transparent mix-blend-multiply"></div>

        {/* Content Container */}
        <div 
          className={`relative z-10 h-full flex flex-col justify-center px-8 md:px-16 transition-all duration-1000 delay-300 ${
            isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}
        >
          <div className="w-8 h-1 bg-blue-400 mb-3 rounded-full"></div>
          
          <h1 className="text-white font-bold tracking-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-1">
            Manager Dashboard
          </h1>
          
          <p className="text-blue-50/80 text-xs md:text-base font-medium tracking-wide max-w-md line-clamp-1 md:line-clamp-none">
            Manage your team and oversee operations effectively.
          </p>

          <div className="mt-4">
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all">
              View Team Reports
            </button>
          </div>
        </div>

        {/* Minimal UI Elements */}
        <div className="absolute top-4 right-6 flex space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
        </div>
      </div>
    </div>
  );
};

export default Banner;