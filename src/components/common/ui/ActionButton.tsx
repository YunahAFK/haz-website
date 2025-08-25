// src/components/ui/ActionButton.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
    icon: LucideIcon;
    onClick: (e: React.MouseEvent) => void;
    title?: string;
    variant?: 'default' | 'danger' | 'success' | 'warning';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
    icon: Icon,
    onClick,
    title,
    variant = 'default',
    size = 'md',
    disabled = false,
    className = ''
}) => {
    const sizeClasses = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3'
    };

    const iconSizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    const variantClasses = {
        default: 'text-gray-700 hover:bg-gray-50',
        danger: 'text-red-600 hover:bg-red-50',
        success: 'text-green-600 hover:bg-green-50',
        warning: 'text-yellow-600 hover:bg-yellow-50'
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!disabled) {
            onClick(e);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            title={title}
            className={`
        bg-white rounded-lg shadow-md transition-colors 
        ${sizeClasses[size]} 
        ${variantClasses[variant]}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
        >
            <Icon className={iconSizeClasses[size]} />
        </button>
    );
};