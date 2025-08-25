// src/components/common/ImageUploadPreview.tsx
import React from 'react';
import { X, CheckCircle, ImageIcon } from 'lucide-react';
import { UploadedImage } from '../../hooks/useImageUpload';

interface ImageUploadPreviewProps {
  image: UploadedImage;
  progress?: number;
  onRemove: () => void;
  className?: string;
  aspectRatio?: 'square' | 'video';
}

export const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({
  image,
  progress = 0,
  onRemove,
  className = "",
  aspectRatio = 'square'
}) => {
  const aspectClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-video';
  
  return (
    <div className={`relative bg-gray-50 rounded-lg border border-gray-200 p-3 ${className}`}>
      {/* Image Preview */}
      <div className={`${aspectClass} bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden`}>
        {image.url ? (
          <img src={image.url} alt="Upload preview" className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="w-8 h-8 text-gray-400" />
        )}
      </div>

      {/* File Info */}
      <div className="text-xs text-gray-600 mb-2 truncate">
        {image.file?.name || (image.isExisting ? 'Existing Image' : 'Uploaded Image')}
      </div>

      {/* Upload Progress */}
      {image.uploading && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {image.error && (
        <div className="text-xs text-red-600 mb-2">{image.error}</div>
      )}

      {/* Remove Button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Success Indicator */}
      {!image.uploading && !image.error && image.url && (
        <div className="absolute top-1 left-1 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
          <CheckCircle className="w-3 h-3" />
        </div>
      )}
    </div>
  );
};