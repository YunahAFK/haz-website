// src/components/lecture/AdminLectureCard.tsx
import React from 'react';
import { Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { HazardCard } from '../../../hazard/HazardCard';
import { LoadingOverlay } from '../LoadingOverlay';
import { StatusBadge } from '../StatusBadge';
import { ActionButton } from '../ActionButton';

interface Lecture {
    id: string;
    title: string;
    description: string;
    content: string;
    image?: string;
    images?: string[];
    createdAt: any;
    status: 'draft' | 'published';
    isPublished?: boolean;
}

interface AdminLectureCardProps {
    lecture: Lecture;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onTogglePublish: (id: string) => void;
    isUpdating?: boolean;
    onView?: (id: string) => void;
}

export const AdminLectureCard: React.FC<AdminLectureCardProps> = ({
    lecture,
    onEdit,
    onDelete,
    onTogglePublish,
    isUpdating = false,
    onView
}) => {
    const isPublished = lecture.status === 'published' || lecture.isPublished;

    const getImageUrl = () =>
        lecture.image ||
        lecture.images?.[0] ||
        'https://images.unsplash.com/photo-1689344683256-40b734b440e7?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

    const getDescription = () =>
        lecture.description ||
        lecture.content?.substring(0, 100) + '...' ||
        'No description available';

    const handleCardClick = () => {
        if (onView) {
            onView(lecture.id);
        } else {
            console.log(`Viewing ${lecture.title}`);
        }
    };

    return (
        <div className="relative group">
            <HazardCard
                title={lecture.title}
                image={getImageUrl()}
                description={getDescription()}
                onClick={handleCardClick}
            />

            {/* Loading Overlay */}
            <LoadingOverlay
                isVisible={isUpdating}
                message="Updating..."
            />

            {/* Admin Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl">
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    <StatusBadge
                        status={isPublished ? 'Published' : 'Draft'}
                        variant={isPublished ? 'published' : 'draft'}
                    />
                </div>

                {/* Image Count Badge */}
                {lecture.images && lecture.images.length > 0 && (
                    <div className="absolute top-3 left-3">
                        <StatusBadge
                            status={`${lecture.images.length} image${lecture.images.length !== 1 ? 's' : ''}`}
                            variant="info"
                        />
                    </div>
                )}

                {/* Admin Controls */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex space-x-2">
                        <ActionButton
                            icon={isPublished ? EyeOff : Eye}
                            onClick={() => onTogglePublish(lecture.id)}
                            title={isPublished ? 'Unpublish' : 'Publish'}
                            disabled={isUpdating}
                            variant="default"
                        />
                        <ActionButton
                            icon={Edit3}
                            onClick={() => onEdit(lecture.id)}
                            title="Edit"
                            disabled={isUpdating}
                            variant="default"
                        />
                        <ActionButton
                            icon={Trash2}
                            onClick={() => onDelete(lecture.id)}
                            title="Delete"
                            disabled={isUpdating}
                            variant="danger"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};