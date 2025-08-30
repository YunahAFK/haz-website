// src/components/common/ErrorDisplay.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface ErrorDisplayProps {
    error: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Not Available</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </button>
            </div>
        </div>
    );
};