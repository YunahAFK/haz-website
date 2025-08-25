// src/types/uploadedImage.ts
export interface UploadedImage {
    id?: string;
    file?: File | null;
    url?: string | null;
    publicId?: string;
    uploading?: boolean;
    error?: string;
    isExisting?: boolean;
    uploadProgress?: number;
}
