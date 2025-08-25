// src/hooks/useAutoSave.ts
import { useState, useEffect, useCallback } from 'react';

interface UseAutoSaveOptions {
    delay?: number; // milliseconds
    onSave?: () => Promise<void>;
    onError?: (error: Error) => void;
}

export const useAutoSave = (
    data: string,
    lectureId: string | null,
    options: UseAutoSaveOptions = {}
) => {
    const { delay = 2000, onSave, onError } = options;
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const performSave = useCallback(async () => {
        if (!lectureId || !data.trim()) return;

        setIsSaving(true);
        setSaveError(null);

        try {
            if (onSave) {
                await onSave();
            }
            setLastSaved(new Date());
            setHasUnsavedChanges(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Auto-save failed';
            setSaveError(errorMessage);
            if (onError) {
                onError(error instanceof Error ? error : new Error(errorMessage));
            }
        } finally {
            setIsSaving(false);
        }
    }, [lectureId, data, onSave, onError]);

    useEffect(() => {
        if (!data.trim() || !lectureId) return;

        setHasUnsavedChanges(true);
        const timer = setTimeout(performSave, delay);

        return () => clearTimeout(timer);
    }, [data, lectureId, delay, performSave]);

    // Manual save function
    const saveNow = useCallback(() => {
        performSave();
    }, [performSave]);

    return {
        lastSaved,
        isSaving,
        hasUnsavedChanges,
        saveError,
        saveNow
    };
};
