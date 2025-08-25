// src/components/common/ImageUploadPreview.tsx
import React from 'react';
import { X, CheckCircle, ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
import { UploadedImage } from '../../types/uploadedImage';

interface ImageUploadPreviewProps {
  image: UploadedImage;
  progress?: number;
  onRemove: () => void;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
  showFileInfo?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({
  image,
  progress = 0,
  onRemove,
  className = "",
  aspectRatio = 'square',
  showFileInfo = true,
  size = 'md'
}) => {
  // Determine aspect ratio class
  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'video': return 'aspect-video';
      case 'portrait': return 'aspect-[3/4]';
      default: return 'aspect-square';
    }
  };

  // Determine size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return {
        container: 'p-2',
        image: 'mb-1',
        text: 'text-xs',
        button: 'w-5 h-5 top-0.5 right-0.5',
        buttonIcon: 'w-2.5 h-2.5',
        indicator: 'w-5 h-5 top-0.5 left-0.5',
        indicatorIcon: 'w-2.5 h-2.5'
      };
      case 'lg': return {
        container: 'p-4',
        image: 'mb-3',
        text: 'text-sm',
        button: 'w-7 h-7 top-1 right-1',
        buttonIcon: 'w-4 h-4',
        indicator: 'w-7 h-7 top-1 left-1',
        indicatorIcon: 'w-4 h-4'
      };
      default: return {
        container: 'p-3',
        image: 'mb-2',
        text: 'text-xs',
        button: 'w-6 h-6 top-1 right-1',
        buttonIcon: 'w-3 h-3',
        indicator: 'w-6 h-6 top-1 left-1',
        indicatorIcon: 'w-3 h-3'
      };
    }
  };

  const aspectClass = getAspectClass();
  const sizeClasses = getSizeClasses();

  // Calculate actual progress (prefer image.uploadProgress over prop)
  const currentProgress = image.uploadProgress ?? progress;

  // Determine file name to display
  const getDisplayName = () => {
    if (image.file?.name) {
      return image.file.name;
    }
    if (image.isExisting) {
      return 'Existing Image';
    }
    return 'Uploaded Image';
  };

  // Format file size
  const getFileSize = () => {
    if (!image.file?.size) return null;
    const bytes = image.file.size;
    const mb = (bytes / (1024 * 1024)).toFixed(1);
    return `${mb} MB`;
  };

  return (
    <div className={`relative bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 hover:border-gray-300 ${sizeClasses.container} ${className}`}>
      {/* Image Preview Container */}
      <div className={`${aspectClass} bg-gray-100 rounded-lg ${sizeClasses.image} flex items-center justify-center overflow-hidden relative`}>
        {image.url ? (
          <>
            <img
              src={image.url}
              alt="Upload preview"
              className="w-full h-full object-cover transition-opacity duration-200"
              style={{
                opacity: image.uploading ? 0.7 : 1
              }}
            />
            {/* Uploading overlay */}
            {image.uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <ImageIcon className="w-8 h-8 mb-1" />
            {image.uploading && (
              <div className="text-xs text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              </div>
            )}
          </div>
        )}

        {/* Upload Progress Overlay */}
        {image.uploading && currentProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-1">
            <div className="flex items-center justify-between text-xs text-white mb-1">
              <span>Uploading...</span>
              <span>{Math.round(currentProgress)}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-1">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* File Information */}
      {showFileInfo && (
        <div className="space-y-1">
          <div className={`${sizeClasses.text} text-gray-600 truncate font-medium`}>
            {getDisplayName()}
          </div>

          {/* File size and additional info */}
          {(image.file?.size || image.isExisting) && (
            <div className={`${sizeClasses.text} text-gray-500 flex items-center justify-between`}>
              {getFileSize() && <span>{getFileSize()}</span>}
              {image.isExisting && (
                <span className="text-blue-600 font-medium">Existing</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upload Progress Bar (when not in overlay mode) */}
      {image.uploading && currentProgress > 0 && !image.url && (
        <div className="mt-2">
          <div className={`flex items-center justify-between ${sizeClasses.text} text-gray-600 mb-1`}>
            <span className="flex items-center">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Uploading...
            </span>
            <span>{Math.round(currentProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {image.error && (
        <div className={`${sizeClasses.text} text-red-600 mt-2 p-2 bg-red-50 rounded border border-red-200 flex items-start`}>
          <AlertCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
          <span className="break-words">{image.error}</span>
        </div>
      )}

      {/* Remove Button */}
      <button
        type="button"
        onClick={onRemove}
        disabled={image.uploading}
        className={`absolute ${sizeClasses.button} bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105`}
        title="Remove image"
      >
        <X className={sizeClasses.buttonIcon} />
      </button>

      {/* Success Indicator */}
      {!image.uploading && !image.error && image.url && (
        <div
          className={`absolute ${sizeClasses.indicator} bg-green-500 text-white rounded-full flex items-center justify-center shadow-sm`}
          title="Upload successful"
        >
          <CheckCircle className={sizeClasses.indicatorIcon} />
        </div>
      )}

      {/* Upload Status Badge */}
      {image.uploading && (
        <div className="absolute top-1 left-1 right-1">
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md flex items-center justify-center">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Uploading
          </div>
        </div>
      )}
    </div>
  );
};