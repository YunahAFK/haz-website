import {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    getDoc,
} from 'firebase/firestore';
import { Lecture } from '../../types/common/lecture';
import { Activity } from '../../types/(LectureDetail)/activity';

class LectureService {
    private firestore = getFirestore();

    /**
     * Fetch all lectures that are marked as published,
     * ordered by `createdAt` in descending order (newest first).
     *
     * @returns Promise<Lecture[]> - Array of published lectures
     */
    async getPublishedLectures(): Promise<Lecture[]> {
        const lecturesQuery = query(
            collection(this.firestore, 'lectures'),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(lecturesQuery);
        const lectures: Lecture[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const isPublished = data.status === 'published' || data.isPublished;

            if (isPublished) {
                lectures.push({
                    id: doc.id,
                    title: data.title || 'Untitled Lecture',
                    description: data.description || '',
                    content: data.content || '',
                    image: data.image,
                    images: data.images || [],
                    createdAt: data.createdAt,
                    status: data.status,
                    isPublished: data.isPublished,
                });
            }
        });

        return lectures;
    }

    /**
     * Fetch a single lecture by its document ID from Firestore.
     *
     * @param lectureId - Firestore document ID of the lecture
     * @returns Promise<Lecture | null> - Lecture object if found, otherwise null
     */
    async getLectureById(lectureId: string): Promise<Lecture | null> {
        const lectureDoc = await getDoc(doc(this.firestore, 'lectures', lectureId));

        if (!lectureDoc.exists()) return null;

        const data = lectureDoc.data();

        return {
            id: lectureDoc.id,
            title: data.title || 'Untitled Lecture',
            description: data.description || '',
            content: data.content || '',
            image: data.image,
            images: data.images || [],
            createdAt: data.createdAt,
            status: data.status,
            isPublished: data.isPublished,
        };
    }

    /**
   * Fetch all activities for a specific lecture, ordered by createdAt ASC.
   *
   * @param lectureId - Firestore lecture document ID
   * @returns Promise<Activity[]> - Array of activities
   */
    async getLectureActivities(lectureId: string): Promise<Activity[]> {
        const activitiesRef = collection(this.firestore, 'lectures', lectureId, 'activities');
        const q = query(activitiesRef, orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);

        const activities: Activity[] = [];
        querySnapshot.forEach((docSnap) => {
            activities.push({
                id: docSnap.id,
                ...docSnap.data(),
            } as Activity);
        });

        return activities;
    }
}

export const lectureService = new LectureService();