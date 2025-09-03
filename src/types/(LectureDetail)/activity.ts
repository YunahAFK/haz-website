// src/types/activity.ts
export interface Activity {
    id: string;
    type: 'multiple-choice' | 'short-answer';
    question: string;
    options?: ActivityOption[];
    correctAnswer?: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface ActivityOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface UserAnswer {
    activityId: string;
    answer: string | number;
    isCorrect: boolean;
}
