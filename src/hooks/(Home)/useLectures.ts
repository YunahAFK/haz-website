// src/hooks/(Home)/useLectures.ts
import { useState, useEffect, useCallback } from 'react';
import { Lecture } from '../../types/common/lecture';
import { lectureService } from '../../services/(Home)/lectureService';

interface UseLecturesReturn {
    lectures: Lecture[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Fetches all published lectures using the lectureService.
 * Returns lectures, loading/error states, and a refetch function.
 */

export const useLectures = (): UseLecturesReturn => {
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLectures = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const publishedLectures = await lectureService.getPublishedLectures();
            setLectures(publishedLectures);
        } catch (err) {
            console.error('Error fetching lectures:', err);
            setError('Failed to load content. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLectures();
    }, [fetchLectures]);

    return {
        lectures,
        isLoading,
        error,
        refetch: fetchLectures,
    };
};