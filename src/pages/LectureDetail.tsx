// Updated LectureDetail.tsx with slide generation modal
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Monitor } from 'lucide-react';
import { useLecture } from '../hooks/useLecture';
import { useActivities } from '../hooks/useLectureActivities';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { LectureHeader } from '../components/lecture/user/LectureHeader';
import { LectureContent } from '../components/lecture/user/LectureContent';
import { ProgressBar } from '../components/common/ProgressBar';
import { ActivityComponent } from '../components/lecture/user/ActivityComponent';
import { QuizResults } from '../components/lecture/user/QuizResults';
import { PresentationMode } from '../components/PresentationMode';
import { SlideGenerationModal } from '../components/SlideGenerationModal';
import { Slide } from '../types/presentation';

export default function LectureDetail() {
  const { lectureId } = useParams<{ lectureId: string }>();
  const [showActivities, setShowActivities] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [showSlideGeneration, setShowSlideGeneration] = useState(false);
  const [presentationSlides, setPresentationSlides] = useState<Slide[]>([]);

  const { lecture, isLoading, error } = useLecture(lectureId);
  const {
    activities,
    userAnswers,
    currentActivityIndex,
    activitiesLoading,
    quizCompleted,
    fetchActivities,
    handleAnswerSubmit,
    resetQuiz,
    getQuizScore
  } = useActivities(lectureId);

  const startActivities = () => {
    if (activities.length === 0) {
      fetchActivities();
    }
    setShowActivities(true);
  };

  const startPresentation = () => {
    if (activities.length === 0) {
      fetchActivities();
    }
    setShowSlideGeneration(true);
  };

  const handleSlidesGenerated = (slides: Slide[]) => {
    setPresentationSlides(slides);
    setPresentationMode(true);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading Content..." />;
  }

  if (error || !lecture) {
    return <ErrorDisplay error={error || 'Lecture not found'} />;
  }

  if (presentationMode) {
    return (
      <PresentationMode
        slides={presentationSlides}
        onExit={() => setPresentationMode(false)}
        onActivityAnswer={handleAnswerSubmit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LectureHeader />

      {!showActivities ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4">
            <button
              onClick={startPresentation}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Presentation Mode
            </button>
          </div>
          
          <LectureContent
            lecture={lecture}
            onStartActivities={startActivities}
            activitiesLoading={activitiesLoading}
          />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!quizCompleted ? (
            <div className="bg-white rounded-lg shadow-sm border p-8">
              {activities.length > 0 && (
                <>
                  <ProgressBar
                    current={currentActivityIndex}
                    total={activities.length}
                  />
                  <ActivityComponent
                    activity={activities[currentActivityIndex]}
                    onAnswer={handleAnswerSubmit}
                    userAnswer={userAnswers.find(
                      a => a.activityId === activities[currentActivityIndex]?.id
                    )}
                  />
                </>
              )}
            </div>
          ) : (
            <QuizResults
              score={getQuizScore()}
              onRetry={resetQuiz}
              onBackToContent={() => setShowActivities(false)}
            />
          )}
        </div>
      )}

      {/* Slide Generation Modal */}
      {showSlideGeneration && lecture && (
        <SlideGenerationModal
          lecture={lecture}
          activities={activities}
          onSlidesGenerated={handleSlidesGenerated}
          onClose={() => setShowSlideGeneration(false)}
        />
      )}
    </div>
  );
}