// src/hooks/useActivities.ts
import { useState, useEffect } from 'react';
import {
    getFirestore,
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    serverTimestamp,
    query,
    orderBy
} from 'firebase/firestore';
import { Activity } from '../types/activity';

export const useActivities = (lectureId: string | null) => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const firestore = getFirestore();

    const fetchActivities = async () => {
        if (!lectureId) return;

        setIsLoading(true);
        try {
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
        } catch (error) {
            console.error('Error fetching activities:', error);
            throw new Error('Failed to load activities. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const saveActivity = async (activityData: Omit<Activity, 'id'>, editingId?: string): Promise<string> => {
        if (!lectureId) {
            throw new Error('No lecture ID provided');
        }

        try {
            if (editingId) {
                // update existing activity
                const docRef = doc(firestore, 'lectures', lectureId, 'activities', editingId);
                await updateDoc(docRef, {
                    ...activityData,
                    updatedAt: serverTimestamp()
                });

                setActivities(prev => prev.map(activity =>
                    activity.id === editingId
                        ? { ...activity, ...activityData }
                        : activity
                ));

                return 'Question updated successfully!';
            } else {
                // add new activity
                const activitiesRef = collection(firestore, 'lectures', lectureId, 'activities');
                const docRef = await addDoc(activitiesRef, {
                    ...activityData,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });

                const newActivity: Activity = {
                    id: docRef.id,
                    ...activityData
                };
                setActivities(prev => [...prev, newActivity]);

                return 'Question added successfully!';
            }
        } catch (error) {
            console.error('Error saving activity:', error);
            throw new Error('Failed to save question. Please try again.');
        }
    };

    const deleteActivity = async (activityId: string): Promise<string> => {
        if (!lectureId) {
            throw new Error('No lecture ID provided');
        }

        try {
            const docRef = doc(firestore, 'lectures', lectureId, 'activities', activityId);
            await deleteDoc(docRef);

            setActivities(prev => prev.filter(activity => activity.id !== activityId));
            return 'Question deleted successfully!';
        } catch (error) {
            console.error('Error deleting activity:', error);
            throw new Error('Failed to delete question. Please try again.');
        }
    };

    useEffect(() => {
        if (lectureId) {
            fetchActivities().catch(() => {
                // error is handled in fetchActivities
            });
        }
    }, [lectureId]);

    return {
        activities,
        isLoading,
        saveActivity,
        deleteActivity,
        refetch: fetchActivities
    };
};