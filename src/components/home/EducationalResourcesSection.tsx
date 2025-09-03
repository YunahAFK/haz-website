import React from 'react';
import { EmptyState } from '../common/EmptyState';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { LectureGrid } from './LectureGrid';
import { LectureCard } from '../../types/(Home)/lecture-card';

interface EducationalResourcesSectionProps {
    lectures: LectureCard[];
    isLoading: boolean;
    onLectureClick: (lectureId: string) => void;
}

export const EducationalResourcesSection: React.FC<EducationalResourcesSectionProps> = ({
    lectures,
    isLoading,
    onLectureClick,
}) => (
    <section id="hazards" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            <div className="mb-12">
                <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                    Educational Resources
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
            </div>

            {isLoading ? (
                <LoadingSpinner message="Loading Content..." />
            ) : lectures.length > 0 ? (
                <LectureGrid lectures={lectures} onLectureClick={onLectureClick} />
            ) : (
                <EmptyState
                    title="No Content Available"
                    description="educational content is being prepared, please check back soon."
                />
            )}
        </div>
    </section>
);