import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

const PremiumLoader = ({ message = "Curating your experience...", fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="relative mb-8">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#bae6fd]/20 to-[#e2e8f0]/20 rounded-full blur-2xl animate-pulse" />
        
        {/* Rotating Diamond/Gem Shape */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg 
            className="w-full h-full text-silver-gradient animate-[spin_4s_linear_infinite]" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M50 5L95 50L50 95L5 50L50 5Z" 
              stroke="currentColor" 
              strokeWidth="1" 
              className="opacity-20"
            />
            <path 
              d="M50 15L85 50L50 85L15 50L50 15Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              className="opacity-40"
              strokeDasharray="10 5"
            />
            <path 
              d="M50 25L75 50L50 75L25 50L50 25Z" 
              stroke="currentColor" 
              strokeWidth="3" 
              className="opacity-80 shadow-lg"
            />
          </svg>
          
          {/* Central Sparkle */}
          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <SparklesIcon className="w-8 h-8 text-[#e2e8f0] opacity-60" />
          </div>
        </div>

        {/* Orbiting Particles */}
        <div className="absolute inset-0 animate-[spin_3s_linear_infinite_reverse]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#bae6fd] rounded-full shadow-[0_0_10px_#bae6fd]" />
        </div>
        <div className="absolute inset-0 animate-[spin_5s_linear_infinite]">
          <div className="absolute bottom-4 right-4 w-1 h-1 bg-[#e2e8f0] rounded-full shadow-[0_0_8px_#e2e8f0]" />
        </div>
      </div>

      {/* Labeling */}
      <h3 className="font-display text-lg font-bold text-white tracking-widest uppercase mb-2 opacity-90">
        SARAM
      </h3>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#64748b] animate-pulse">
        {message}
      </p>
      
      {/* Elegance Bar */}
      <div className="mt-6 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#e2e8f0]/20 to-transparent mx-auto" />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#020617] flex items-center justify-center backdrop-blur-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(186,230,253,0.03)_0%,_transparent_70%)]" />
        {content}
      </div>
    );
  }

  return content;
};

export default PremiumLoader;
