// src/hooks/useImageUpload.ts
import { useState } from 'react';
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';

export interface UploadedImage {
  file: File | null;
  url: string | null;
  uploading: boolean;
  error?: string;
  isExisting?: boolean;
  id?: string;
}

interface UseImageUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  storagePath: string;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export const useImageUpload = (options: UseImageUploadOptions) => {
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const storage = getStorage();
  
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/'],
    storagePath,
    onSuccess,
    onError
  } = options;

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.some(type => file.type.startsWith(type))) {
      return `${file.name} is not a valid image file.`;
    }
    
    if (file.size > maxSize) {
      return `${file.name} is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`;
    }
    
    return null;
  };

  const uploadToFirebase = async (file: File, imageId?: string): Promise<string> => {
    const id = imageId || `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const storageRef = ref(storage, `${storagePath}/${id}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(prev => ({ ...prev, [id]: progress }));
        },
        (error) => {
          setUploadProgress(prev => {
            const { [id]: _, ...rest } = prev;
            return rest;
          });
          const errorMsg = 'Upload failed';
          onError?.(errorMsg);
          reject(new Error(errorMsg));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadProgress(prev => {
              const { [id]: _, ...rest } = prev;
              return rest;
            });
            onSuccess?.(downloadURL);
            resolve(downloadURL);
          } catch (error) {
            const errorMsg = 'Failed to get download URL';
            onError?.(errorMsg);
            reject(new Error(errorMsg));
          }
        }
      );
    });
  };

  const getProgress = (imageId: string) => uploadProgress[imageId] || 0;

  return {
    validateFile,
    uploadToFirebase,
    uploadProgress,
    getProgress
  };
};