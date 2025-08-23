// src/pages/Home.tsx - WITH MOCK NAVIGATION CARDS FOR TESTING
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HazardCard } from '../components/hazard/HazardCard';
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
  images: string[];
  createdAt: any;
  isPublished?: boolean;
}

// MOCK CARDS FOR TESTING - Remove these when you have real data
const MOCK_LECTURE_CARDS = [
  {
    id: 'typhoon-safety',
    title: 'Typhoon Safety and Preparedness',
    description: 'Learn essential safety measures and preparation techniques to protect yourself and your family during typhoon season.',
    image: 'https://images.unsplash.com/photo-1601110958456-0bee398ce406?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'earthquake-response',
    title: 'Earthquake Response and Safety',
    description: 'Essential knowledge about earthquake preparedness, response techniques, and post-earthquake safety measures.',
    image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c2?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0'
  },
  {
    id: 'volcanic-eruption',
    title: 'Volcanic Eruption Preparedness',
    description: 'Comprehensive guide to understanding volcanic threats and protecting yourself from ash fall and lava flows.',
    image: 'https://images.unsplash.com/photo-1623059570754-5462839e76a7?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const firestore = getFirestore();

  // Fetch published lectures from Firestore
  const fetchPublishedLectures = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Only fetch published lectures for public viewing
      const lecturesQuery = query(
        collection(firestore, 'lectures'),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(lecturesQuery);
      const fetchedLectures: Lecture[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedLectures.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          content: data.content,
          images: data.images || [],
          createdAt: data.createdAt,
          isPublished: data.isPublished
        });
      });
      
      setLectures(fetchedLectures);
      
      // If no real data found, enable mock data
      if (fetchedLectures.length === 0) {
        setUseMockData(true);
      }
    } catch (err) {
      console.error('Error fetching lectures:', err);
      setError('Failed to load content. Showing demo content instead.');
      setUseMockData(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Load lectures on component mount
  useEffect(() => {
    fetchPublishedLectures();
  }, []);

  const handleLectureClick = (lectureId: string) => {
    navigate(`/lecture/${lectureId}`);
  };

  const handleMockCardClick = (mockId: string) => {
    navigate(`/lecture/${mockId}`);
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
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-yellow-800">{error}</p>
                  <button
                    onClick={fetchPublishedLectures}
                    className="ml-auto text-yellow-600 hover:text-yellow-800 underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Lectures/Hazards Section */}
        <section id="hazards" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Educational Resources
                {useMockData && (
                  <span className="text-sm text-blue-600 ml-2 bg-blue-100 px-2 py-1 rounded">
                    Demo Mode
                  </span>
                )}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading content...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Real Firestore Data */}
                {!useMockData && lectures.length > 0 && 
                  lectures.map((lecture) => (
                    <HazardCard
                      key={lecture.id}
                      title={lecture.title}
                      image={
                        lecture.images.length > 0 
                          ? lecture.images[0] 
                          : 'https://images.unsplash.com/photo-1689344683256-40b734b440e7?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                      }
                      description={
                        lecture.description || 
                        (lecture.content.length > 150 
                          ? lecture.content.substring(0, 150) + '...' 
                          : lecture.content)
                      }
                      onClick={() => handleLectureClick(lecture.id)}
                    />
                  ))
                }

                {/* Mock Data for Testing */}
                {(useMockData || lectures.length === 0) &&
                  MOCK_LECTURE_CARDS.map((mockCard) => (
                    <HazardCard
                      key={mockCard.id}
                      title={mockCard.title}
                      image={mockCard.image}
                      description={mockCard.description}
                      onClick={() => handleMockCardClick(mockCard.id)}
                    />
                  ))
                }

                {/* Empty State */}
                {!isLoading && !useMockData && lectures.length === 0 && (
                  <div className="col-span-3 text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-500 mb-2">No Content Available</h3>
                    <p className="text-gray-400 mb-4">
                      Educational content is being prepared. Please check back soon.
                    </p>
                    <button
                      onClick={() => setUseMockData(true)}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View Demo Content
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}