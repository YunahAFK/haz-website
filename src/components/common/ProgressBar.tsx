// src/components/common/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
    current: number;
    total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
    const percentage = Math.round(((current + 1) / total) * 100);

    return (
        <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {current + 1} of {total}</span>
                <span>{percentage}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};