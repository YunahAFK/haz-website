import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { Lecture } from '../../types/common/lecture';

class LectureService {
    private firestore = getFirestore();

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
}

export const lectureService = new LectureService();