// src/components/ui/LoadingOverlay.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'light' | 'dark';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    isVisible,
    message = 'Loading...',
    className = '',
    size = 'md',
    variant = 'light'
}) => {
    if (!isVisible) return null;

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    const variantClasses = {
        light: 'bg-white bg-opacity-75 text-gray-600',
        dark: 'bg-black bg-opacity-50 text-white'
    };

    return (
        <div className={`absolute inset-0 ${variantClasses[variant]} rounded-xl flex items-center justify-center z-10 ${className}`}>
            <div className="text-center">
                <Loader2 className={`${sizeClasses[size]} animate-spin mx-auto mb-2`} />
                {message && (
                    <p className="text-sm">{message}</p>
                )}
            </div>
        </div>
    );
};