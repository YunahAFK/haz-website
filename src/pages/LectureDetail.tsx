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

export default function LectureDetail() {
  const { lectureId } = useParams<{ lectureId: string }>();
  const [showActivities, setShowActivities] = useState(false);

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

  if (isLoading) {
    return <LoadingSpinner message="Loading Content..." />;
  }

  if (error || !lecture) {
    return <ErrorDisplay error={error || 'Lecture not found'} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LectureHeader />

      {!showActivities ? (
        <LectureContent
          lecture={lecture}
          onStartActivities={startActivities}
          activitiesLoading={activitiesLoading}
        />
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
    </div>
  );
}