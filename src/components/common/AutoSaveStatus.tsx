
// src/components/common/AutoSaveStatus.tsx
import React from 'react';
import { Save, Clock, AlertCircle, Check } from 'lucide-react';

interface AutoSaveStatusProps {
    lastSaved: Date | null;
    isSaving: boolean;
    hasUnsavedChanges: boolean;
    saveError: string | null;
    onRetry?: () => void;
}

export const AutoSaveStatus: React.FC<AutoSaveStatusProps> = ({
    lastSaved,
    isSaving,
    hasUnsavedChanges,
    saveError,
    onRetry
}) => {
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isSaving) {
        return (
            <div className="flex items-center text-sm text-blue-600">
                <Save className="w-4 h-4 mr-2 animate-spin" />
                <span>Saving...</span>
            </div>
        );
    }

    if (saveError) {
        return (
            <div className="flex items-center text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>Save failed</span>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="ml-2 text-xs underline hover:no-underline"
                    >
                        Retry
                    </button>
                )}
            </div>
        );
    }

    if (hasUnsavedChanges) {
        return (
            <div className="flex items-center text-sm text-amber-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>Unsaved changes</span>
            </div>
        );
    }

    if (lastSaved) {
        return (
            <div className="flex items-center text-sm text-green-600">
                <Check className="w-4 h-4 mr-2" />
                <span>Saved at {formatTime(lastSaved)}</span>
            </div>
        );
    }

    return null;
};