import React from 'react';
import { Map, MapPin } from 'lucide-react';

const MapWidget = ({ data }) => {
  return (
    <div
      className="h-full border border-gray-200 rounded-lg overflow-hidden shadow-sm"
      style={{ backgroundColor: data.bgColor }}
    >
      <div className="h-full bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center justify-center p-4">
        <div className="relative">
          <Map size={64} className="text-green-600 mb-3" />
          <MapPin size={24} className="text-red-500 absolute top-4 left-1/2 -translate-x-1/2 animate-bounce" />
        </div>
        <p className="text-lg font-semibold text-gray-800 mt-2">{data.title}</p>
        <p className="text-sm text-gray-600 mt-1">Interactive Map View</p>
        <div className="mt-4 px-4 py-2 bg-white rounded-lg shadow-sm">
          <p className="text-xs text-gray-500">Lat: 40.7128° N</p>
          <p className="text-xs text-gray-500">Long: 74.0060° W</p>
        </div>
      </div>
    </div>
  );
};

export default MapWidget;