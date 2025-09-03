// src/hooks/useActivityForm.ts
import { useState } from 'react';
import { Activity, ActivityOption } from '../types/(LectureDetail)/activity';

export const useActivityForm = (initialActivity?: Activity) => {
    const [type, setType] = useState<'multiple-choice' | 'short-answer'>(
        initialActivity?.type || 'multiple-choice'
    );
    const [question, setQuestion] = useState(initialActivity?.question || '');
    const [options, setOptions] = useState<ActivityOption[]>(
        initialActivity?.options || [
            { id: '1', text: '', isCorrect: false },
            { id: '2', text: '', isCorrect: false },
        ]
    );
    const [correctAnswer, setCorrectAnswer] = useState(initialActivity?.correctAnswer || '');

    const generateOptionId = () => `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const addOption = () => {
        setOptions(prev => [...prev, { id: generateOptionId(), text: '', isCorrect: false }]);
    };

    const removeOption = (id: string) => {
        setOptions(prev => prev.filter(opt => opt.id !== id));
    };

    const updateOption = (id: string, text: string) => {
        setOptions(prev => prev.map(opt => opt.id === id ? { ...opt, text } : opt));
    };

    const setCorrectOption = (id: string) => {
        setOptions(prev => prev.map(opt => ({ ...opt, isCorrect: opt.id === id })));
    };

    const resetForm = () => {
        setType('multiple-choice');
        setQuestion('');
        setOptions([
            { id: '1', text: '', isCorrect: false },
            { id: '2', text: '', isCorrect: false },
        ]);
        setCorrectAnswer('');
    };

    const isValid = (): boolean => {
        if (!question.trim()) return false;

        if (type === 'multiple-choice') {
            const validOptions = options.filter(opt => opt.text.trim());
            return validOptions.length >= 2 && validOptions.some(opt => opt.isCorrect);
        } else {
            return correctAnswer.trim().length > 0;
        }
    };

    const getFormData = (): Omit<Activity, 'id'> => {
        if (type === 'multiple-choice') {
            const validOptions = options.filter(opt => opt.text.trim());
            return {
                type,
                question: question.trim(),
                options: validOptions
            };
        } else {
            return {
                type,
                question: question.trim(),
                correctAnswer: correctAnswer.trim()
            };
        }
    };

    return {
        type,
        setType,
        question,
        setQuestion,
        options,
        correctAnswer,
        setCorrectAnswer,
        addOption,
        removeOption,
        updateOption,
        setCorrectOption,
        resetForm,
        isValid,
        getFormData
    };
};