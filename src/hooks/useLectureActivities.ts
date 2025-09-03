// src/hooks/useLectureActivities.ts
import { useState } from 'react';
import { lectureService } from '../services/(Home)/lectureService';
import { Activity, UserAnswer } from '../types/(LectureDetail)/activity';

/**
 * 
 * Fetch & Manage Lecture Activities
 * Fetch
 * - Lecture Activities via lectureService
 * 
 * Manage
 * - User Answers
 * - Current Activity Index
 * - Quiz Completion Status
 * - Quiz Score Calculation
 * - Reset Quiz
 * 
 * @param lectureId - Firestore document ID of the lecture
 * @returns { 
 * activities , 
 * userAnswers, 
 * currentActivityIndex, 
 * activitiesLoading, 
 * quizCompleted, 
 * fetchActivities, 
 * handleAnswerSubmit, 
 * resetQuiz, 
 * getQuizScore 
 * }
 */

export const useActivities = (lectureId: string | undefined) => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
    const [activitiesLoading, setActivitiesLoading] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);

    const fetchActivities = async () => {
        if (!lectureId) return;

        try {
            setActivitiesLoading(true);
            const activitiesData = await lectureService.getLectureActivities(lectureId);
            setActivities(activitiesData);
        } catch (err) {
            console.error('Error fetching activities:', err);
        } finally {
            setActivitiesLoading(false);
        }
    };

    const handleAnswerSubmit = (answer: string | number) => {
        const currentActivity = activities[currentActivityIndex];
        if (!currentActivity) return;

        let isCorrect = false;

        if (currentActivity.type === 'multiple-choice') {
            const selected = currentActivity.options?.find(opt => opt.id === answer || opt.text === answer);
            isCorrect = selected?.isCorrect ?? false;
        } else {
            isCorrect =
                answer.toString().toLowerCase().trim() ===
                currentActivity.correctAnswer?.toLowerCase().trim();
        }

        const userAnswer: UserAnswer = {
            activityId: currentActivity.id,
            answer,
            isCorrect
        };

        setUserAnswers(prev => [...prev, userAnswer]);

        if (currentActivityIndex < activities.length - 1) {
            setTimeout(() => setCurrentActivityIndex(prev => prev + 1), 1500);
        } else {
            setTimeout(() => setQuizCompleted(true), 1500);
        }
    };

    const getQuizScore = () => {
        const correct = userAnswers.filter((answer) => answer.isCorrect).length;
        return {
            correct,
            total: activities.length,
            percentage:
                activities.length > 0 ? Math.round((correct / activities.length) * 100) : 0,
        };
    };

    const resetQuiz = () => {
        setUserAnswers([]);
        setCurrentActivityIndex(0);
        setQuizCompleted(false);
    };

    return {
        activities,
        userAnswers,
        currentActivityIndex,
        activitiesLoading,
        quizCompleted,
        fetchActivities,
        handleAnswerSubmit,
        resetQuiz,
        getQuizScore,
    };
};