import React from 'react';
import { DownloadIcon } from './Icon';

interface ImageDisplayProps {
  imageUrl: string;
  onClose?: () => void;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `nanogen-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-gray-700 bg-gray-800/50 shadow-2xl">
      <img 
        src={imageUrl} 
        alt="Generated content" 
        className="w-full h-auto max-h-[600px] object-contain mx-auto"
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-end">
        <button 
          onClick={handleDownload}
          className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium text-sm"
        >
          <DownloadIcon className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
};
