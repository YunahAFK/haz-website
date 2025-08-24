// src/components/common/FileUploadButton.tsx
import React from 'react';
import { Upload } from 'lucide-react';

interface FileUploadButtonProps {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  multiple?: boolean;
  label: string;
  description?: string;
  className?: string;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFileSelect,
  accept = "image/*",
  multiple = false,
  label,
  description,
  className = "mb-4"
}) => (
  <div className={className}>
    <label className="inline-flex items-center px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
      <Upload className="w-4 h-4 mr-2 text-gray-600" />
      <span className="text-sm text-gray-700">{label}</span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onFileSelect}
        className="hidden"
      />
    </label>
    {description && (
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    )}
  </div>
);