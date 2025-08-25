// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HazardCard } from '../components/common/HazardCard';
import { Footer } from '../components/layout/Footer';
import { Loader2, AlertCircle, BookOpen } from 'lucide-react';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';

interface Lecture {
  id: string;
  title: string;
  description: string;
  content: string;
  image?: string;
  images?: string[];
  createdAt: any;
  status?: 'draft' | 'published';
  isPublished?: boolean;
}

export default function Home() {
  const navigate = useNavigate();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const firestore = getFirestore();

  const fetchPublishedLectures = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const lecturesQuery = query(
        collection(firestore, 'lectures'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(lecturesQuery);
      const fetchedLectures: Lecture[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const isPublished = data.status === 'published' || data.isPublished;

        if (isPublished) {
          fetchedLectures.push({
            id: doc.id,
            title: data.title || 'Untitled Lecture',
            description: data.description || '',
            content: data.content || '',
            image: data.image,
            images: data.images || [],
            createdAt: data.createdAt,
            status: data.status,
            isPublished: data.isPublished
          });
        }
      });

      setLectures(fetchedLectures);
    } catch (err) {
      console.error('Error fetching lectures:', err);
      setError('Failed to load content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishedLectures();
  }, []);

  const handleLectureClick = (lectureId: string) => {
    navigate(`/lecture/${lectureId}`);
  };

  const getImageUrl = (lecture: Lecture) => {
    return lecture.image || lecture.images?.[0] ||
      'https://images.unsplash.com/photo-1689344683256-40b734b440e7?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  };

  const getDescription = (lecture: Lecture) => {
    if (lecture.description) return lecture.description;
    return lecture.content.length > 150
      ? lecture.content.substring(0, 150) + '...'
      : lecture.content || 'No description available';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      <main className="relative">
        {/* Hero Section */}
        <section className="text-center py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl sm:text-8xl font-bold text-gray-900 mb-8 tracking-tight">
              HAZ
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              stay informed about natural hazards and protect your community with
              comprehensive disaster information and preparedness resources.
            </p>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <section className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-800">{error}</p>
                  <button
                    onClick={fetchPublishedLectures}
                    className="ml-auto text-red-600 hover:text-red-800 underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Educational Resources Section */}
        <section id="hazards" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Educational Resources
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading Content...</span>
              </div>
            ) : lectures.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {lectures.map((lecture) => (
                  <HazardCard
                    key={lecture.id}
                    title={lecture.title}
                    image={getImageUrl(lecture)}
                    description={getDescription(lecture)}
                    onClick={() => handleLectureClick(lecture.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-500 mb-2">No Content Available</h3>
                <p className="text-gray-400">
                  Educational content is being prepared. Please check back soon.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}