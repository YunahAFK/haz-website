// src/pages/LectureDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  BookOpen, 
  AlertCircle, 
  Loader2,
  CheckCircle,
  XCircle,
  Play
} from 'lucide-react';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
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
  updatedAt: any;
  status?: 'draft' | 'published';
  isPublished?: boolean;
}

interface Activity {
  id: string;
  type: 'multiple-choice' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer?: string;
  correctOption?: number;
  createdAt: any;
}

interface UserAnswer {
  activityId: string;
  answer: string | number;
  isCorrect: boolean;
}

export default function LectureDetail() {
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  const firestore = getFirestore();
  
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [showActivities, setShowActivities] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Fetch lecture details
  const fetchLecture = async () => {
    if (!lectureId) return;

    try {
      setIsLoading(true);
      const lectureDoc = await getDoc(doc(firestore, 'lectures', lectureId));
      
      if (lectureDoc.exists()) {
        const data = lectureDoc.data();
        setLecture({
          id: lectureDoc.id,
          title: data.title || 'Untitled Lecture',
          description: data.description || '',
          content: data.content || '',
          image: data.image,
          images: data.images || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          status: data.status,
          isPublished: data.isPublished
        });
      } else {
        setError('Lecture not found');
      }
    } catch (err) {
      console.error('Error fetching lecture:', err);
      setError('Failed to load lecture content');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch activities for the lecture
  const fetchActivities = async () => {
    if (!lectureId) return;

    try {
      setActivitiesLoading(true);
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

  // Handle activity answer submission
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

    // Move to next activity or complete quiz
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

  // Start activities
  const startActivities = () => {
    if (activities.length === 0) {
      fetchActivities();
    }
    setShowActivities(true);
  };

  // Reset quiz
  const resetQuiz = () => {
    setUserAnswers([]);
    setCurrentActivityIndex(0);
    setQuizCompleted(false);
  };

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp.toDate()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  // Calculate quiz score
  const getQuizScore = () => {
    const correct = userAnswers.filter(answer => answer.isCorrect).length;
    return {
      correct,
      total: activities.length,
      percentage: activities.length > 0 ? Math.round((correct / activities.length) * 100) : 0
    };
  };

  useEffect(() => {
    fetchLecture();
  }, [lectureId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading Content...</p>
        </div>
      </div>
    );
  }

  if (error || !lecture) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Not Available</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>
      </div>

      {!showActivities ? (
        // Lecture Content View
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Hero Image */}
            {lecture.image && (
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={lecture.image}
                  alt={lecture.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8">
              {/* Title and Metadata */}
              <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {lecture.title}
                </h1>
                
                {lecture.description && (
                  <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                    {lecture.description}
                  </p>
                )}

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  {lecture.createdAt && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Published {formatDate(lecture.createdAt)}
                    </div>
                  )}
                  {lecture.updatedAt && lecture.updatedAt !== lecture.createdAt && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Updated {formatDate(lecture.updatedAt)}
                    </div>
                  )}
                </div>
              </header>

              {/* Content */}
              <div className="prose prose-lg max-w-none mb-8">
                <div dangerouslySetInnerHTML={{ __html: lecture.content }} />
              </div>

              {/* Activities Section */}
              <div className="border-t pt-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Test Your Knowledge
                      </h3>
                      <p className="text-gray-600 mb-4">
                        complete the activity to reinforce your learning.
                      </p>
                    </div>
                    <BookOpen className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  </div>
                  
                  <button
                    onClick={startActivities}
                    disabled={activitiesLoading}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {activitiesLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Loading Activities...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Activity
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      ) : (
        // Activities View
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!quizCompleted ? (
            // Current Activity
            <div className="bg-white rounded-lg shadow-sm border p-8">
              {activities.length > 0 && (
                <>
                  {/* Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Question {currentActivityIndex + 1} of {activities.length}</span>
                      <span>{Math.round(((currentActivityIndex + 1) / activities.length) * 100)}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentActivityIndex + 1) / activities.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <ActivityComponent
                    activity={activities[currentActivityIndex]}
                    onAnswer={handleAnswerSubmit}
                    userAnswer={userAnswers.find(a => a.activityId === activities[currentActivityIndex]?.id)}
                  />
                </>
              )}
            </div>
          ) : (
            // Quiz Results
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

// Activity Component
const ActivityComponent: React.FC<{
  activity: Activity;
  onAnswer: (answer: string | number) => void;
  userAnswer?: UserAnswer;
}> = ({ activity, onAnswer, userAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | number>('');
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnswer) return;
    
    onAnswer(selectedAnswer);
    setShowResult(true);
  };

  useEffect(() => {
    setSelectedAnswer('');
    setShowResult(false);
  }, [activity.id]);

  useEffect(() => {
    if (userAnswer) {
      setShowResult(true);
    }
  }, [userAnswer]);

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        {activity.question}
      </h3>

      {!showResult ? (
        <form onSubmit={handleSubmit}>
          {activity.type === 'multiple-choice' ? (
            <div className="space-y-3 mb-6">
              {activity.options?.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="answer"
                    value={index}
                    checked={selectedAnswer === index}
                    onChange={(e) => setSelectedAnswer(parseInt(e.target.value))}
                    className="mr-3"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="mb-6">
              <input
                type="text"
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                placeholder="enter your answer..."
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedAnswer}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        </form>
      ) : (
        // Show result
        <div className="text-center">
          {userAnswer?.isCorrect ? (
            <div>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-green-800 mb-2">Correct!</h4>
              <p className="text-gray-600">great job! moving to the next question...</p>
            </div>
          ) : (
            <div>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-red-800 mb-2">Incorrect</h4>
              {activity.type === 'multiple-choice' && activity.correctOption !== undefined ? (
                <p className="text-gray-600">
                  the correct answer was: <strong>{activity.options?.[activity.correctOption]}</strong>
                </p>
              ) : (
                <p className="text-gray-600">
                  the correct answer was: <strong>{activity.correctAnswer}</strong>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Quiz Results Component
const QuizResults: React.FC<{
  score: { correct: number; total: number; percentage: number };
  onRetry: () => void;
  onBackToContent: () => void;
}> = ({ score, onRetry, onBackToContent }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
      <div className="mb-6">
        <div className="text-6xl font-bold text-blue-600 mb-2">
          {score.percentage}%
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Quiz Complete!
        </h2>
        <p className="text-gray-600">
          You got {score.correct} out of {score.total} questions correct.
        </p>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={onBackToContent}
          className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back to Content
        </button>
      </div>
    </div>
  );
};