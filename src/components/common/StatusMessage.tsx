// src/components/common/StatusMessage.tsx
import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { StatusType } from '../../hooks/useStatusMessage';

interface StatusMessageProps {
  type: StatusType;
  message: string;
  className?: string;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ 
  type, 
  message, 
  className = "mb-6" 
}) => {
  if (!type) return null;

  const isSuccess = type === 'success';
  
  return (
    <div className={`${className} p-4 rounded-lg flex items-center space-x-3 ${
      isSuccess 
        ? 'bg-green-50 border border-green-200' 
        : 'bg-red-50 border border-red-200'
    }`}>
      {isSuccess ? (
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
      )}
      <p className={`text-sm ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
        {message}
      </p>
    </div>
  );
};