// src/components/activity/ActivityPreview.tsx
import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { Activity } from '../../types/activity';

interface ActivityPreviewProps {
    activity: Activity;
    className?: string;
}

export const ActivityPreview: React.FC<ActivityPreviewProps> = ({
    activity,
    className = ""
}) => (
    <div className={`mt-4 ${className}`}>
        {activity.type === 'multiple-choice' && activity.options ? (
            <div className="space-y-2">
                {activity.options.map((option) => (
                    <div
                        key={option.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg ${option.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                            }`}
                    >
                        {option.isCorrect ? (
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                            <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${option.isCorrect ? 'text-green-800 font-medium' : 'text-gray-700'
                            }`}>
                            {option.text}
                        </span>
                    </div>
                ))}
            </div>
        ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-800 font-medium">
                        Correct Answer: {activity.correctAnswer}
                    </span>
                </div>
            </div>
        )}
    </div>
);