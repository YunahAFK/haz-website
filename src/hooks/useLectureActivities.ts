// src/hooks/useLectureActivities.ts
import { useState } from 'react';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Activity, UserAnswer } from '../types/lecture';

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
            const firestore = getFirestore();
            const activitiesRef = collection(firestore, 'lectures', lectureId, 'activities');
            const q = query(activitiesRef, orderBy('createdAt', 'asc'));
            const querySnapshot = await getDocs(q);

            const activitiesData: Activity[] = [];
            querySnapshot.forEach((doc) => {
                activitiesData.push({
                    id: doc.id,
                    ...doc.data()
                } as Activity);
            });

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
            isCorrect = answer === currentActivity.correctOption;
        } else {
            isCorrect = answer.toString().toLowerCase().trim() ===
                currentActivity.correctAnswer?.toLowerCase().trim();
        }

        const userAnswer: UserAnswer = {
            activityId: currentActivity.id,
            answer,
            isCorrect
        };

        setUserAnswers(prev => [...prev, userAnswer]);

        // move to next activity or complete quiz
        if (currentActivityIndex < activities.length - 1) {
            setTimeout(() => {
                setCurrentActivityIndex(prev => prev + 1);
            }, 1500);
        } else {
            setTimeout(() => {
                setQuizCompleted(true);
            }, 1500);
        }
    };

    const resetQuiz = () => {
        setUserAnswers([]);
        setCurrentActivityIndex(0);
        setQuizCompleted(false);
    };

    const getQuizScore = () => {
        const correct = userAnswers.filter(answer => answer.isCorrect).length;
        return {
            correct,
            total: activities.length,
            percentage: activities.length > 0 ? Math.round((correct / activities.length) * 100) : 0
        };
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
        getQuizScore
    };
};