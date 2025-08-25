// src/hooks/useImageUpload.ts
import { useState, useCallback } from 'react';
import { UploadedImage } from '../types/uploadedImage';
import { useCloudinaryUpload } from './useCloudinaryUpload';

interface UseImageUploadProps {
  cloudName: string;
  uploadPreset: string;
  maxImages?: number;
  onUploadSuccess?: (url: string, publicId: string) => void;
  onUploadError?: (error: string) => void;
}

export const useImageUpload = (props: UseImageUploadProps) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const {
    maxImages = 1,
    onUploadSuccess,
    onUploadError
  } = props;

  const { validateFile, uploadToCloudinary, getProgress } = useCloudinaryUpload({
    cloudName: props.cloudName,
    uploadPreset: props.uploadPreset,
    onSuccess: onUploadSuccess,
    onError: onUploadError
  });

  // Add new image
  const addImage = useCallback(async (file: File): Promise<void> => {
    if (images.length >= maxImages) {
      onUploadError?.(`Maximum ${maxImages} image(s) allowed`);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      onUploadError?.(validationError);
      return;
    }

    const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add image to state with uploading status
    const newImage: UploadedImage = {
      id: imageId,
      file,
      url: null,
      uploading: true,
      error: undefined,
      isExisting: false,
      uploadProgress: 0
    };

    setImages(prev => [...prev, newImage]);

    try {
      const result = await uploadToCloudinary(file, imageId);

      // Update image with successful upload data
      setImages(prev => prev.map(img =>
        img.id === imageId
          ? {
            ...img,
            url: result.url,
            publicId: result.publicId,
            uploading: false,
            uploadProgress: 100,
            error: undefined
          }
          : img
      ));

    } catch (error) {
      // Update image with error
      setImages(prev => prev.map(img =>
        img.id === imageId
          ? {
            ...img,
            uploading: false,
            error: error instanceof Error ? error.message : 'Upload failed'
          }
          : img
      ));
    }
  }, [images.length, maxImages, validateFile, uploadToCloudinary, onUploadError]);

  // Remove image
  const removeImage = useCallback((imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  }, []);

  // Clear all images
  const clearImages = useCallback(() => {
    setImages([]);
  }, []);

  // Get current upload progress for an image
  const getImageProgress = useCallback((imageId: string): number => {
    const image = images.find(img => img.id === imageId);
    if (image?.uploading) {
      return getProgress(imageId);
    }
    return image?.uploadProgress || (image?.url ? 100 : 0);
  }, [images, getProgress]);

  return {
    images,
    addImage,
    removeImage,
    clearImages,
    getImageProgress,
    hasUploadingImages: images.some(img => img.uploading),
    hasErrors: images.some(img => img.error)
  };
};