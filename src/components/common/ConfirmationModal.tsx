// src/components/ui/ConfirmationModal.tsx
import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    itemName?: string;
    isLoading?: boolean;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    icon?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    itemName,
    isLoading = false,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    icon
}) => {
    const variantStyles = {
        danger: {
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            confirmBtn: 'bg-red-600 hover:bg-red-700',
            defaultIcon: <AlertTriangle className="w-6 h-6" />
        },
        warning: {
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            confirmBtn: 'bg-yellow-600 hover:bg-yellow-700',
            defaultIcon: <AlertTriangle className="w-6 h-6" />
        },
        info: {
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            confirmBtn: 'bg-blue-600 hover:bg-blue-700',
            defaultIcon: <AlertTriangle className="w-6 h-6" />
        }
    };

    const styles = variantStyles[variant];

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => !isLoading && onClose()}
            title={title}
            closable={!isLoading}
        >
            <div className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                    <div className={`w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <div className={styles.iconColor}>
                            {icon || styles.defaultIcon}
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-gray-900 font-medium mb-1">{message}</p>
                        {itemName && (
                            <p className="text-sm text-gray-600">"{itemName}"</p>
                        )}
                    </div>
                </div>

                <p className="text-gray-700 mb-6">This action cannot be undone.</p>

                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-4 py-2 ${styles.confirmBtn} text-white rounded-lg flex items-center justify-center disabled:opacity-50 transition-colors`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};