// src/components/lecture/user/LectureHeader.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const LectureHeader: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-white shadow-sm border-b">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </button>
            </div>
        </div>
    );
};