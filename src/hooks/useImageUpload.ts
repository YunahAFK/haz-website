// src/hooks/useImageUpload.ts
export interface UploadedImage {
  file: File | null;
  url: string | null;
  uploading: boolean;
  error?: string;
  isExisting?: boolean;
  id?: string;
}