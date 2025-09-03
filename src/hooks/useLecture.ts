// src/hooks/useLecture.ts
import { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Lecture } from '../types/lecture';

/**
 * Fetches a single lecture document from Firestore by ID.
 * Returns lecture data, loading/error states.
 */

export const useLecture = (lectureId: string | undefined) => {
    const [lecture, setLecture] = useState<Lecture | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLecture = async () => {
        if (!lectureId) return;

        try {
            setIsLoading(true);
            const firestore = getFirestore();
            const lectureDoc = await getDoc(doc(firestore, 'lectures', lectureId));

            if (lectureDoc.exists()) {
                const data = lectureDoc.data();
                setLecture({
                    id: lectureDoc.id,
                    title: data.title || 'Untitled Lecture',
                    description: data.description || '',
                    content: data.content || '',
                    image: data.image,
                    images: data.images || [],
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    status: data.status,
                    isPublished: data.isPublished
                });
            } else {
                setError('Lecture not found');
            }
        } catch (err) {
            console.error('Error fetching lecture:', err);
            setError('Failed to load lecture content');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLecture();
    }, [lectureId]);

    return { lecture, isLoading, error };
};