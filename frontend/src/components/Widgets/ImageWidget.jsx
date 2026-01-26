// src/components/Widgets/ImageWidget.jsx
import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

const ImageWidget = ({ data }) => {
  const [imageError, setImageError] = useState(false);

  const getObjectFitClass = () => {
    switch (data.objectFit) {
      case 'contain':
        return 'object-contain';
      case 'fill':
        return 'object-fill';
      default:
        return 'object-cover';
    }
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ 
        backgroundColor: data.backgroundColor || '#f8fafc',
        borderRadius: `${data.borderRadius || 8}px`,
      }}
    >
      {!imageError ? (
        <>
          <img
            src={data.url}
            alt={data.alt || 'Image'}
            className={`w-full ${data.showCaption && data.caption ? 'flex-1' : 'h-full'} ${getObjectFitClass()}`}
            onError={() => setImageError(true)}
          />
          {data.showCaption && data.caption && (
            <div className="px-4 py-3 bg-white/90 backdrop-blur-sm border-t border-gray-200">
              <p className="text-sm text-gray-700 text-center">
                {data.caption}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="h-full flex flex-col items-center justify-center bg-gray-50">
          <ImageOff className="text-gray-300 mb-3" size={48} />
          <p className="text-sm font-medium text-gray-400">Image not available</p>
          {data.alt && (
            <p className="text-xs text-gray-400 mt-1">{data.alt}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageWidget;