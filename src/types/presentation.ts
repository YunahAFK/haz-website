// src/types/presentation.ts
import { Activity } from './lecture';

export interface Slide {
    id: string;
    type: 'title' | 'content' | 'image' | 'activity';
    title?: string;
    content?: string;
    image?: string;
    activity?: Activity;
}

export interface PresentationSettings {
    autoAdvance: boolean;
    slideInterval: number; // seconds
    showNotes: boolean;
    theme: 'light' | 'dark' | 'blue';
}

export type { Activity } from './lecture';
