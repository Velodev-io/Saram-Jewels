import React, { useState } from 'react';

const ImageZoom = ({ src, alt, className = "", children }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleImageClick = () => {
    setIsZoomed(true);
  };

  const handleCloseZoom = () => {
    setIsZoomed(false);
  };

  const handleZoomIn = (e) => {
    const img = e.target.parentElement.previousElementSibling.querySelector('img');
    const scale = parseFloat(img.style.transform.replace('scale(', '').replace(')', '')) || 1;
    const newScale = Math.min(3, scale + 0.2);
    img.style.transform = `scale(${newScale})`;
  };

  const handleZoomOut = (e) => {
    const img = e.target.parentElement.previousElementSibling.querySelector('img');
    const scale = parseFloat(img.style.transform.replace('scale(', '').replace(')', '')) || 1;
    const newScale = Math.max(0.5, scale - 0.2);
    img.style.transform = `scale(${newScale})`;
  };

  const handleReset = (e) => {
    const img = e.target.parentElement.previousElementSibling.querySelector('img');
    img.style.transform = 'scale(1)';
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const scale = parseFloat(e.target.style.transform.replace('scale(', '').replace(')', '')) || 1;
    const newScale = e.deltaY > 0 ? Math.max(0.5, scale - 0.1) : Math.min(3, scale + 0.1);
    e.target.style.transform = `scale(${newScale})`;
  };

  const handleMouseEnter = (e) => {
    e.target.style.transform = 'scale(1.5)';
    e.target.style.cursor = 'zoom-out';
  };

  const handleMouseLeave = (e) => {
    e.target.style.transform = 'scale(1)';
    e.target.style.cursor = 'zoom-in';
  };

  return (
    <>
      {/* Clickable Image */}
      <div onClick={handleImageClick} className="cursor-pointer">
        {children || (
          <img
            src={src}
            alt={alt}
            className={`${className} hover:opacity-80 transition-opacity`}
            title="Click to zoom"
          />
        )}
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            {/* Close Button */}
            <button
              onClick={handleCloseZoom}
              className="absolute top-2 right-2 z-10 text-white hover:text-gray-300 text-2xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
            
            {/* Image Container with Zoom */}
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={src}
                alt={alt}
                className="w-full h-auto max-h-[80vh] object-contain cursor-zoom-in"
                style={{
                  transform: 'scale(1)',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onWheel={handleWheel}
              />
            </div>
            
            {/* Zoom Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              <button
                onClick={handleZoomOut}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 px-3 py-1 rounded-lg text-sm font-medium"
              >
                Zoom Out
              </button>
              <button
                onClick={handleZoomIn}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 px-3 py-1 rounded-lg text-sm font-medium"
              >
                Zoom In
              </button>
              <button
                onClick={handleReset}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 px-3 py-1 rounded-lg text-sm font-medium"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageZoom;
