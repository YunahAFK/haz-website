import { useState, useEffect } from 'react';
import { Lecture } from '../../types/common/lecture';
import { lectureService } from '../../services/(Home)/lectureService';

/**
 * Fetch
 * - Single Lecture via lectureService
 * 
 * @param lectureId - Firestore document ID of the lecture
 * @returns { lecture, isLoading, error }
 */

export const useLecture = (lectureId: string | undefined) => {
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLecture = async () => {
    if (!lectureId) return;

    try {
      setIsLoading(true);
      const lectureData = await lectureService.getLectureById(lectureId);

      if (lectureData) {
        setLecture(lectureData);
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
