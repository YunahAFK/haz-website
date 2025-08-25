// src/components/ui/StatusBadge.tsx
import React from 'react';

interface StatusBadgeProps {
    status: string;
    variant?: 'published' | 'draft' | 'archived' | 'pending' | 'success' | 'error' | 'warning' | 'info';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    variant,
    size = 'md',
    className = ''
}) => {
    // Auto-detect variant based on status if not provided
    const getVariant = () => {
        if (variant) return variant;

        const statusLower = status.toLowerCase();
        if (statusLower.includes('publish') || statusLower.includes('active')) return 'published';
        if (statusLower.includes('draft') || statusLower.includes('pending')) return 'draft';
        if (statusLower.includes('archive')) return 'archived';
        if (statusLower.includes('success')) return 'success';
        if (statusLower.includes('error') || statusLower.includes('fail')) return 'error';
        if (statusLower.includes('warning')) return 'warning';
        return 'info';
    };

    const currentVariant = getVariant();

    const sizeClasses = {
        sm: 'px-1.5 py-0.5 text-xs',
        md: 'px-2 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm'
    };

    const variantClasses = {
        published: 'bg-green-100 text-green-800 border-green-200',
        draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        archived: 'bg-gray-100 text-gray-800 border-gray-200',
        pending: 'bg-blue-100 text-blue-800 border-blue-200',
        success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        error: 'bg-red-100 text-red-800 border-red-200',
        warning: 'bg-orange-100 text-orange-800 border-orange-200',
        info: 'bg-sky-100 text-sky-800 border-sky-200'
    };

    return (
        <span
            className={`
        ${sizeClasses[size]} 
        ${variantClasses[currentVariant]} 
        rounded-full font-medium border inline-flex items-center justify-center
        ${className}
      `}
        >
            {status}
        </span>
    );
};