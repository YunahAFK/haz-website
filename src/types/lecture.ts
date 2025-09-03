// src/types/lecture.ts
export interface Lecture {
    id: string;
    title: string;
    description: string;
    content: string;
    image?: string;
    images?: string[];
    status?: 'draft' | 'published';
    createdAt: any;
    updatedAt: any;
    isPublished?: boolean;
}

export interface Activity {
  id: string;
  type: 'multiple-choice' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer?: string;
  correctOption?: number;
  createdAt: any;
}

export interface UserAnswer {
  activityId: string;
  answer: string | number;
  isCorrect: boolean;
}

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

// for creating new lectures
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

