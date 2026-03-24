import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'default', showText = true, className = '' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-20 h-20'
  };

  const textSizes = {
    small: 'text-lg',
    default: 'text-2xl',
    large: 'text-3xl',
    xlarge: 'text-4xl'
  };

  const svgSizes = {
    small: 'w-5 h-5',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const LogoIcon = () => (
    <div className={`relative ${sizeClasses[size]} bg-black rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 hover:bg-gray-800 ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        className={`${svgSizes[size]} text-white`}
        fill="currentColor"
      >
        {/* Main flowing S curve - more ribbon-like and elegant */}
        <path d="M20 25 C30 15 40 15 50 25 C60 35 60 45 50 55 C40 65 30 65 20 55 C10 45 10 35 20 25 Z" />
        <path d="M50 25 C60 35 60 45 50 55 C40 65 30 65 20 55 C10 45 10 35 20 25 C30 15 40 15 50 25 Z" />
        
        {/* Decorative circles - positioned in the curves like original */}
        <circle cx="25" cy="35" r="2.5" fill="white" />
        <circle cx="75" cy="65" r="3.5" fill="white" />
      </svg>
    </div>
  );

  if (!showText) {
    return <LogoIcon />;
  }

  return (
    <Link to="/" className="flex items-center group">
      <LogoIcon />
      <span className={`ml-3 font-jewelry font-bold text-gray-800 group-hover:text-gray-900 transition-colors ${textSizes[size]}`}>
        Saram
      </span>
    </Link>
  );
};

export default Logo;
