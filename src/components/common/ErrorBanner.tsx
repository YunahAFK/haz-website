import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBannerProps {
    message: string;
    onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="ml-auto text-red-600 hover:text-red-800 underline transition-colors"
                >
                    Retry
                </button>
            )}
        </div>
    </div>
);