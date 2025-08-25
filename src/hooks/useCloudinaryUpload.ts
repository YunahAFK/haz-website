// src/hooks/useCloudinaryUpload.ts
import { useState, useCallback } from 'react';

interface CloudinaryConfig {
    cloudName: string;
    uploadPreset: string;
    onSuccess?: (url: string, publicId: string) => void;
    onError?: (error: string) => void;
    maxFileSize?: number; // in MB
    allowedFormats?: string[];
}

interface UploadProgress {
    [key: string]: number;
}

export const useCloudinaryUpload = (config: CloudinaryConfig) => {
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
    const [isUploading, setIsUploading] = useState(false);

    const {
        cloudName,
        uploadPreset,
        onSuccess,
        onError,
        maxFileSize = 5, // 5MB default
        allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    } = config;

    // Validate file before upload
    const validateFile = useCallback((file: File): string | null => {
        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxFileSize) {
            return `File size must be less than ${maxFileSize}MB`;
        }

        // Check file format
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!fileExtension || !allowedFormats.includes(fileExtension)) {
            return `Supported formats: ${allowedFormats.join(', ').toUpperCase()}`;
        }

        // Check if it's actually an image
        if (!file.type.startsWith('image/')) {
            return 'Please select a valid image file';
        }

        return null;
    }, [maxFileSize, allowedFormats]);

    // Upload to Cloudinary
    const uploadToCloudinary = useCallback((file: File, uploadId?: string): Promise<{ url: string; publicId: string }> => {
        return new Promise((resolve, reject) => {
            const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            const progressId = uploadId || `upload-${Date.now()}`;

            // Prepare form data
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);

            // Optional: Add transformation parameters
            formData.append('folder', 'lectures');
            formData.append('quality', 'auto');
            formData.append('fetch_format', 'auto');

            xhr.open('POST', url, true);
            setIsUploading(true);

            // Track upload progress
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(prev => ({
                        ...prev,
                        [progressId]: percentComplete
                    }));
                }
            });

            // Handle response
            xhr.onload = () => {
                setIsUploading(false);

                // Clean up progress tracking
                setUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[progressId];
                    return newProgress;
                });

                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        const result = {
                            url: response.secure_url,
                            publicId: response.public_id
                        };

                        onSuccess?.(result.url, result.publicId);
                        resolve(result);
                    } catch (parseError) {
                        const error = 'Failed to parse upload response';
                        onError?.(error);
                        reject(new Error(error));
                    }
                } else {
                    let errorMessage = 'Upload failed';

                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        errorMessage = errorResponse.error?.message || errorMessage;
                    } catch {
                        // Use default error message
                    }

                    onError?.(errorMessage);
                    reject(new Error(errorMessage));
                }
            };

            // Handle network errors
            xhr.onerror = () => {
                setIsUploading(false);
                setUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[progressId];
                    return newProgress;
                });

                const error = 'Network error occurred during upload';
                onError?.(error);
                reject(new Error(error));
            };

            // Handle timeout
            xhr.ontimeout = () => {
                setIsUploading(false);
                setUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[progressId];
                    return newProgress;
                });

                const error = 'Upload timeout. Please try again.';
                onError?.(error);
                reject(new Error(error));
            };

            // Set timeout (30 seconds)
            xhr.timeout = 30000;

            xhr.send(formData);
        });
    }, [cloudName, uploadPreset, onSuccess, onError]);

    // Get progress for specific upload
    const getProgress = useCallback((uploadId: string): number => {
        return uploadProgress[uploadId] || 0;
    }, [uploadProgress]);

    return {
        validateFile,
        uploadToCloudinary,
        getProgress,
        isUploading,
        uploadProgress
    };
};