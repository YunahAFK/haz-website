// src/services/lectureService.ts
import { useFirestore } from '../hooks/useFirestore';

export interface LectureData {
    title: string;
    description: string;
    image: string;
    content: string;
    images: string[];
    status: 'draft' | 'published';
    createdAt?: any;
    updatedAt?: any;
}

export interface LectureUpdateData {
    title?: string;
    description?: string;
    image?: string;
    content?: string;
    images?: string[];
    status?: 'draft' | 'published';
}

export class LectureService {
    constructor(private firestore: ReturnType<typeof useFirestore>) { }

    async getLecture(lectureId: string): Promise<LectureData | null> {
        try {
            const data = await this.firestore.getDocument('lectures', lectureId) as LectureData;

            if (!data) {
                return null;
            }

            return {
                title: data.title || '',
                description: data.description || '',
                image: data.image || '',
                content: data.content || '',
                images: data.images || [],
                status: data.status || 'draft',
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
            };
        } catch (error) {
            console.error('error fetching lecture data:', error);
            throw new Error('failed to load lecture data');
        }
    }

    async updateLecture(lectureId: string, updates: LectureUpdateData): Promise<void> {
        try {
            await this.firestore.updateDocument('lectures', lectureId, updates);
        } catch (error) {
            console.error('error updating lecture:', error);
            throw new Error('failed to update lecture');
        }
    }

    async publishLecture(lectureId: string, data: { title: string; content: string; images: string[] }): Promise<void> {
        // validation for publishing
        if (!data.title || !data.title.trim()) {
            throw new Error('title is required for publishing');
        }

        if (!data.content || !data.content.trim() || data.content === '<p><br></p>') {
            throw new Error('content is required for publishing');
        }

        try {
            await this.updateLecture(lectureId, {
                ...data,
                status: 'published'
            });
        } catch (error) {
            console.error('error publishing lecture:', error);
            throw new Error('failed to publish lecture');
        }
    }

    async saveDraft(lectureId: string, data: { title: string; content: string; images: string[] }): Promise<void> {
        try {
            await this.updateLecture(lectureId, {
                ...data,
                status: 'draft'
            });
        } catch (error) {
            console.error('error saving draft:', error);
            throw new Error('failed to save draft');
        }
    }

    async autoSave(lectureId: string, data: { title: string; content: string; images: string[] }): Promise<void> {
        const hasContent = data.title.trim() || (data.content.trim() && data.content !== '<p><br></p>');

        if (!hasContent) {
            return;
        }

        try {
            await this.updateLecture(lectureId, data);
        } catch (error) {
            console.error('error auto-saving content:', error);
            // don't throw error for auto-save failures to avoid disrupting user experience
        }
    }
}
