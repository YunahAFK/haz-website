// src/types/uploadImage.ts
export interface UploadedImage {
    id?: string;
    file?: File;
    url?: string;
    uploading?: boolean;
    error?: string;
    isExisting?: boolean;
}
