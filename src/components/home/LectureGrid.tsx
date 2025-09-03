import React from 'react';
import { HazardCard } from '../common/HazardCard';
import { LectureCard } from '../../types/(Home)/lecture-card';

interface LectureGridProps {
    lectures: LectureCard[];
    onLectureClick: (lectureId: string) => void;
}

export const LectureGrid: React.FC<LectureGridProps> = ({ lectures, onLectureClick }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {lectures.map((lecture) => (
            <HazardCard
                key={lecture.id}
                title={lecture.title}
                image={lecture.imageUrl}
                description={lecture.description}
                onClick={() => onLectureClick(lecture.id)}
            />
        ))}
    </div>
);