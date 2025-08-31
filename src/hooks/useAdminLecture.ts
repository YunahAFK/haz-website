// src/hooks/useAdminLecture.ts
import { useState, useEffect, useCallback } from 'react';
import { useFirestore } from './useFirestore';
import { useStatusMessage } from './useStatusMessage';
import { LectureService, LectureData } from '../services/lectureService';

interface UseLectureReturn {
    lectureData: LectureData;
    isLoading: boolean;
    status: ReturnType<typeof useStatusMessage>['status'];
    updateContent: (content: string) => void;
    updateTitle: (title: string) => void;
    updateImages: (images: string[]) => void;
    saveDraft: () => Promise<void>;
    publishLecture: () => Promise<void>;
    autoSave: () => Promise<void>;
    setStatusMessage: ReturnType<typeof useStatusMessage>['setStatusMessage'];
    clearStatus: ReturnType<typeof useStatusMessage>['clearStatus'];
}

export const useLecture = (lectureId: string | null): UseLectureReturn => {
    const [lectureData, setLectureData] = useState<LectureData>({
        title: '',
        description: '',
        image: '',
        content: '',
        images: [],
        status: 'draft'
    });
    const [isLoading, setIsLoading] = useState(true);

    const firestore = useFirestore();
    const { status, setStatusMessage, clearStatus } = useStatusMessage();
    const lectureService = new LectureService(firestore);

    // Fetch lecture data
    const fetchLectureData = useCallback(async () => {
        if (!lectureId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const data = await lectureService.getLecture(lectureId);

            if (data) {
                setLectureData(data);
                console.log('Lecture data loaded:', data);
            } else {
                setStatusMessage('error', 'Lecture not found.', false);
            }
        } catch (error) {
            setStatusMessage('error', 'Failed to load lecture data.', false);
        } finally {
            setIsLoading(false);
        }
    }, [lectureId, lectureService, setStatusMessage]);

    // Load data when lectureId changes
    useEffect(() => {
        fetchLectureData();
    }, [fetchLectureData]);

    // Update functions
    const updateContent = useCallback((content: string) => {
        setLectureData(prev => ({ ...prev, content }));
    }, []);

    const updateTitle = useCallback((title: string) => {
        setLectureData(prev => ({ ...prev, title }));
    }, []);

    const updateImages = useCallback((images: string[]) => {
        setLectureData(prev => ({ ...prev, images }));
    }, []);

    // Save functions
    const saveDraft = useCallback(async () => {
        if (!lectureId) {
            throw new Error('No lecture ID available');
        }

        try {
            await lectureService.saveDraft(lectureId, {
                title: lectureData.title,
                content: lectureData.content,
                images: lectureData.images
            });

            setLectureData(prev => ({ ...prev, status: 'draft' }));
            setStatusMessage('success', 'Draft saved successfully!');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save draft. Please try again.';
            setStatusMessage('error', message, false);
            throw error;
        }
    }, [lectureId, lectureData, lectureService, setStatusMessage]);

    const publishLecture = useCallback(async () => {
        if (!lectureId) {
            throw new Error('No lecture ID available');
        }

        try {
            await lectureService.publishLecture(lectureId, {
                title: lectureData.title,
                content: lectureData.content,
                images: lectureData.images
            });

            setLectureData(prev => ({ ...prev, status: 'published' }));
            setStatusMessage('success', 'Lecture published successfully!');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to publish lecture. Please try again.';

            // Show specific validation messages for publishing
            if (message.includes('Title is required')) {
                setStatusMessage('error', 'Please add a title before publishing.', false);
            } else if (message.includes('Content is required')) {
                setStatusMessage('error', 'Please add content before publishing.', false);
            } else {
                setStatusMessage('error', message, false);
            }

            throw error;
        }
    }, [lectureId, lectureData, lectureService, setStatusMessage]);

    const autoSave = useCallback(async () => {
        if (!lectureId) return;

        try {
            await lectureService.autoSave(lectureId, {
                title: lectureData.title,
                content: lectureData.content,
                images: lectureData.images
            });
            console.log('Content auto-saved');
        } catch (error) {
            console.error('Error auto-saving content:', error);
            // Don't show error message for auto-save failures
        }
    }, [lectureId, lectureData, lectureService]);

    return {
        lectureData,
        isLoading,
        status,
        updateContent,
        updateTitle,
        updateImages,
        saveDraft,
        publishLecture,
        autoSave,
        setStatusMessage,
        clearStatus
    };
};