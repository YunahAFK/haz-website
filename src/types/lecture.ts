// types/Lecture.ts
export interface Lecture {
    id: string;
    title: string;
    description: string;
    content: string;
    image: string;
    images: string[];
    status: 'draft' | 'published';
    createdAt: Date;
    updatedAt: Date;
    // Optional legacy field for backward compatibility
    isPublished?: boolean;
}

// Utility function to normalize lecture data from Firestore
export const normalizeLectureData = (data: any): Lecture => ({
    id: data.id || '',
    title: data.title || 'Untitled Lecture',
    description: data.description || '',
    content: data.content || '',
    image: data.image || '',
    images: data.images || [],
    status: data.status || (data.isPublished ? 'published' : 'draft'),
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    isPublished: data.isPublished ?? false
});

// For creating new lectures
export const createEmptyLecture = (): Omit<Lecture, 'id'> => ({
    title: '',
    description: '',
    content: '',
    image: '',
    images: [],
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date()
});

