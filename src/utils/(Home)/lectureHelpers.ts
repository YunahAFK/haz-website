import { Lecture } from '../../types/common/lecture';
import { LectureCard } from '../../types/(Home)/lecture-card';

import { DEFAULT_LECTURE_IMAGE, CONTENT_PREVIEW_LENGTH } from '../../constants/defaults';

export const getImageUrl = (lecture: Lecture): string => {
    return lecture.image || lecture.images?.[0] || DEFAULT_LECTURE_IMAGE;
};

export const getDescription = (lecture: Lecture): string => {
    if (lecture.description) return lecture.description;

    return lecture.content.length > CONTENT_PREVIEW_LENGTH
        ? `${lecture.content.substring(0, CONTENT_PREVIEW_LENGTH)}...`
        : lecture.content || 'No description available';
};

export const transformToCardData = (lecture: Lecture): LectureCard => ({
    id: lecture.id,
    title: lecture.title,
    description: getDescription(lecture),
    imageUrl: getImageUrl(lecture),
});