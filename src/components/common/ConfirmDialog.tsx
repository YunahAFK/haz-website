// src/components/common/ConfirmDialog.tsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger'
}) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: 'text-red-600',
            button: 'bg-red-600 hover:bg-red-700'
        },
        warning: {
            icon: 'text-yellow-600',
            button: 'bg-yellow-600 hover:bg-yellow-700'
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center space-x-3 mb-4">
                    <AlertCircle className={`w-6 h-6 ${variantStyles[variant].icon}`} />
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-white rounded-lg transition-colors ${variantStyles[variant].button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};