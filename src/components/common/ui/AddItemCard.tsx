// src/components/ui/AddItemCard.tsx
import React from 'react';
import { Plus, LucideIcon } from 'lucide-react';

interface AddItemCardProps {
    onClick: () => void;
    title?: string;
    description?: string;
    icon?: LucideIcon;
    className?: string;
    minHeight?: string;
    variant?: 'default' | 'compact';
}

export const AddItemCard: React.FC<AddItemCardProps> = ({
    onClick,
    title = 'Add New Item',
    description = 'Create a new item',
    icon: Icon = Plus,
    className = '',
    minHeight = 'min-h-[320px]',
    variant = 'default'
}) => {
    const isCompact = variant === 'compact';

    return (
        <div
            onClick={onClick}
            className={`
        bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 
        hover:border-blue-500 hover:shadow-xl transition-all duration-300 
        cursor-pointer group flex flex-col items-center justify-center
        ${isCompact ? 'min-h-[200px] p-6' : `${minHeight} p-8`}
        ${className}
      `}
        >
            <div className="text-center">
                <div className={`
          ${isCompact ? 'w-12 h-12 mb-3' : 'w-16 h-16 mb-4'} 
          bg-blue-100 rounded-full flex items-center justify-center mx-auto 
          group-hover:bg-blue-200 transition-colors
        `}>
                    <Icon className={`${isCompact ? 'w-6 h-6' : 'w-8 h-8'} text-blue-600`} />
                </div>
                <h3 className={`
          ${isCompact ? 'text-lg' : 'text-xl'} 
          font-semibold text-gray-700 mb-2
        `}>
                    {title}
                </h3>
                <p className={`
          text-gray-500 
          ${isCompact ? 'text-xs' : 'text-sm'}
        `}>
                    {description}
                </p>
            </div>
        </div>
    );
};