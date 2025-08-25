// src/components/common/FormInput.tsx
import React from 'react';

interface FormInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'text' | 'textarea';
    placeholder?: string;
    required?: boolean;
    rows?: number;
    className?: string;
    maxLength?: number;
}

export const FormInput: React.FC<FormInputProps> = ({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    required = false,
    rows = 4,
    className = "",
    maxLength
}) => {
    const id = label.toLowerCase().replace(/\s+/g, '-');
    const baseClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

    return (
        <div className={className}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && '*'}
            </label>
            {type === 'textarea' ? (
                <textarea
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={rows}
                    maxLength={maxLength}
                    className={`${baseClasses} resize-none`}
                    placeholder={placeholder}
                    required={required}
                />
            ) : (
                <input
                    type="text"
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={maxLength}
                    className={baseClasses}
                    placeholder={placeholder}
                    required={required}
                />
            )}
        </div>
    );
};