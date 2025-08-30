// src/components/common/ErrorMessage.tsx
import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
    onDismiss?: () => void;
    variant?: 'error' | 'warning' | 'info';
    title?: string;
    retryText?: string;
    dismissible?: boolean;
    className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
    message,
    onRetry,
    onDismiss,
    variant = 'error',
    title,
    retryText = 'Retry',
    dismissible = true,
    className = ''
}) => {
    const variantStyles = {
        error: {
            container: 'bg-red-50 border-red-200',
            icon: 'text-red-600',
            title: 'text-red-800',
            message: 'text-red-700',
            button: 'text-red-600 hover:text-red-800'
        },
        warning: {
            container: 'bg-yellow-50 border-yellow-200',
            icon: 'text-yellow-600',
            title: 'text-yellow-800',
            message: 'text-yellow-700',
            button: 'text-yellow-600 hover:text-yellow-800'
        },
        info: {
            container: 'bg-blue-50 border-blue-200',
            icon: 'text-blue-600',
            title: 'text-blue-800',
            message: 'text-blue-700',
            button: 'text-blue-600 hover:text-blue-800'
        }
    };

    const styles = variantStyles[variant];

    return (
        <div className={`${styles.container} border rounded-lg p-4 ${className}`}>
            <div className="flex items-start space-x-3">
                <AlertCircle className={`w-5 h-5 ${styles.icon} flex-shrink-0 mt-0.5`} />

                <div className="flex-1 min-w-0">
                    {title && (
                        <h3 className={`font-medium ${styles.title} mb-1`}>
                            {title}
                        </h3>
                    )}
                    <p className={styles.message}>{message}</p>
                </div>

                <div className="flex items-center space-x-2">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className={`${styles.button} underline hover:no-underline flex items-center space-x-1 text-sm`}
                        >
                            <RefreshCw className="w-3 h-3" />
                            <span>{retryText}</span>
                        </button>
                    )}

                    {dismissible && onDismiss && (
                        <button
                            onClick={onDismiss}
                            className={`${styles.icon} hover:opacity-70 p-1`}
                            aria-label="Dismiss"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};