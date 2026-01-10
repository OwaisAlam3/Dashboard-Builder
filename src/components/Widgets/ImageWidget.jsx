import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

const ImageWidget = ({ data }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="h-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {!imageError ? (
        <img
          src={data.url}
          alt={data.alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="h-full flex flex-col items-center justify-center bg-gray-50">
          <ImageOff className="text-gray-300 mb-2" size={48} />
          <p className="text-sm text-gray-500">Image not available</p>
          <p className="text-xs text-gray-400 mt-1">{data.alt}</p>
        </div>
      )}
    </div>
  );
};

export default ImageWidget;