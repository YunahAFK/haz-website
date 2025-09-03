// src/pages/Home.tsx
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLectures } from '../hooks/(Home)/useLectures';
import { transformToCardData } from '../utils/(Home)/lectureHelpers';
import { HeroSection } from '../components/home/HeroSection';
import { EducationalResourcesSection } from '../components/home/EducationalResourcesSection';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { Footer } from '../components/layout/Footer';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { lectures, isLoading, error, refetch } = useLectures();

  const handleLectureClick = useCallback((lectureId: string) => {
    navigate(`/lecture/${lectureId}`);
  }, [navigate]);

  const lectureCards = useMemo(() => 
    lectures.map(transformToCardData), 
    [lectures]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      <main className="relative">
        <HeroSection />
        
        {error && (
          <section className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <ErrorBanner message={error} onRetry={refetch} />
            </div>
          </section>
        )}

        <EducationalResourcesSection
          lectures={lectureCards}
          isLoading={isLoading}
          onLectureClick={handleLectureClick}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Home;