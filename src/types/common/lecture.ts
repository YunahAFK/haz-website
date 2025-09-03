// src/types/common/lecture.ts
export interface Lecture {
    id: string;
    title: string;
    description: string;
    content: string;
    image?: string;
    images?: string[];
    createdAt: any;
    updatedAt?: any;
    status?: 'draft' | 'published';
    isPublished?: boolean;
}