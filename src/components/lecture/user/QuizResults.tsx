// src/components/lecture/user/QuizResults.tsx
import React from 'react';

interface QuizScore {
    correct: number;
    total: number;
    percentage: number;
}

interface QuizResultsProps {
    score: QuizScore;
    onRetry: () => void;
    onBackToContent: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
    score,
    onRetry,
    onBackToContent
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="mb-6">
                <div className="text-6xl font-bold text-blue-600 mb-2">
                    {score.percentage}%
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Quiz Complete!
                </h2>
                <p className="text-gray-600">
                    You got {score.correct} out of {score.total} questions correct.
                </p>
            </div>

            <div className="flex justify-center space-x-4">
                <button
                    onClick={onRetry}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Try Again
                </button>
                <button
                    onClick={onBackToContent}
                    className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Back to Content
                </button>
            </div>
        </div>
    );
};
