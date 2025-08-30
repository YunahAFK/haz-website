// src/components/lecture/user/LectureContent.tsx
import React from 'react';
import { Calendar, Clock, BookOpen, Play, Loader2 } from 'lucide-react';
import { Lecture } from '../../../types/lecture';

interface LectureContentProps {
    lecture: Lecture;
    onStartActivities: () => void;
    activitiesLoading: boolean;
}

export const LectureContent: React.FC<LectureContentProps> = ({
    lecture,
    onStartActivities,
    activitiesLoading
}) => {
    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        try {
            return new Date(timestamp.toDate()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return '';
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <article className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Hero Image */}
                {lecture.image && (
                    <div className="aspect-video w-full overflow-hidden">
                        <img
                            src={lecture.image}
                            alt={lecture.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="p-8">
                    {/* Title and Metadata */}
                    <header className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                            {lecture.title}
                        </h1>

                        {lecture.description && (
                            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                                {lecture.description}
                            </p>
                        )}

                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                            {lecture.createdAt && (
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Published {formatDate(lecture.createdAt)}
                                </div>
                            )}
                            {lecture.updatedAt && lecture.updatedAt !== lecture.createdAt && (
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    Updated {formatDate(lecture.updatedAt)}
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none mb-8">
                        <div dangerouslySetInnerHTML={{ __html: lecture.content }} />
                    </div>

                    {/* Activities Section */}
                    <div className="border-t pt-8">
                        <div className="bg-blue-50 rounded-lg p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Test Your Knowledge
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Complete the activity to reinforce your learning.
                                    </p>
                                </div>
                                <BookOpen className="w-8 h-8 text-blue-600 flex-shrink-0" />
                            </div>

                            <button
                                onClick={onStartActivities}
                                disabled={activitiesLoading}
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {activitiesLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Loading Activities...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Start Activity
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
};