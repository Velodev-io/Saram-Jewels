import React from 'react';

const LoadingButton = ({ 
  loading, 
  onClick, 
  children, 
  className = "", 
  disabled = false, 
  type = "button",
  variant = "silver" // silver, outline, dark
}) => {
  const baseStyles = "relative flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";
  
  const variants = {
    silver: "btn-silver",
    outline: "btn-outline",
    dark: "bg-[#0f172a] hover:bg-[#1e293b] border border-[rgba(226,232,240,0.1)] text-[#e2e8f0]"
  };

  const currentVariant = variants[variant] || variants.silver;

  return (
    <button
      type={type}
      onClick={loading ? undefined : onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${currentVariant} ${className}`}
    >
      {/* Background Pulse during loading */}
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e2e8f0]/10 to-transparent animate-[shimmer_1.5s_infinite]" />
      )}

      {/* Content */}
      <span className={`inline-flex items-center gap-2 transition-transform duration-300 ${loading ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
        {children}
      </span>

      {/* Loader */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 flex items-center justify-center">
            <svg 
              className="animate-spin h-5 w-5 text-current opacity-80" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" cy="12" r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              ></circle>
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      )}
    </button>
  );
};

export default LoadingButton;
