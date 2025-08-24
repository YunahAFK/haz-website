// src/components/hazard/ActivityTab.tsx
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  CheckCircle,
  Circle,
  AlertCircle,
  Loader2
} from 'lucide-react';

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

import { useLectureContext } from '../../pages/AdminCreateLecture';

// Activity interface
interface Activity {
  id: string;
  type: 'multiple-choice' | 'short-answer';
  question: string;
  options?: { id: string; text: string; isCorrect: boolean }[];
  correctAnswer?: string;
  createdAt?: any;
  updatedAt?: any;
}

interface ActivityOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

// Activity Form Component
const ActivityForm: React.FC<{
  activity?: Activity;
  onSave: (activity: Omit<Activity, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}> = ({ activity, onSave, onCancel, isLoading = false }) => {
  const [type, setType] = useState<'multiple-choice' | 'short-answer'>(
    activity?.type || 'multiple-choice'
  );
  const [question, setQuestion] = useState(activity?.question || '');
  const [options, setOptions] = useState<ActivityOption[]>(
    activity?.options || [
      { id: '1', text: '', isCorrect: false },
      { id: '2', text: '', isCorrect: false },
    ]
  );
  const [correctAnswer, setCorrectAnswer] = useState(activity?.correctAnswer || '');

  const generateOptionId = () => `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addOption = () => {
    setOptions(prev => [...prev, { id: generateOptionId(), text: '', isCorrect: false }]);
  };

  const removeOption = (id: string) => {
    setOptions(prev => prev.filter(opt => opt.id !== id));
  };

  const updateOption = (id: string, text: string) => {
    setOptions(prev => prev.map(opt => opt.id === id ? { ...opt, text } : opt));
  };

  const setCorrectOption = (id: string) => {
    setOptions(prev => prev.map(opt => ({ ...opt, isCorrect: opt.id === id })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;

    if (type === 'multiple-choice') {
      const validOptions = options.filter(opt => opt.text.trim());
      if (validOptions.length < 2) return;
      if (!validOptions.some(opt => opt.isCorrect)) return;

      await onSave({
        type,
        question: question.trim(),
        options: validOptions
      });
    } else {
      if (!correctAnswer.trim()) return;

      await onSave({
        type,
        question: question.trim(),
        correctAnswer: correctAnswer.trim()
      });
    }
  };

  const isValid = () => {
    if (!question.trim()) return false;
    
    if (type === 'multiple-choice') {
      const validOptions = options.filter(opt => opt.text.trim());
      return validOptions.length >= 2 && validOptions.some(opt => opt.isCorrect);
    } else {
      return correctAnswer.trim().length > 0;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'multiple-choice' | 'short-answer')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="multiple-choice">Multiple Choice</option>
            <option value="short-answer">Short Answer</option>
          </select>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question *
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question here..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Multiple Choice Options */}
        {type === 'multiple-choice' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Answer Options *
              </label>
              <button
                type="button"
                onClick={addOption}
                disabled={isLoading || options.length >= 6}
                className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Option
              </button>
            </div>
            
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={option.id} className="flex items-center space-x-3">
                  {/* Correct Answer Selector */}
                  <button
                    type="button"
                    onClick={() => setCorrectOption(option.id)}
                    className="flex-shrink-0"
                    disabled={isLoading}
                  >
                    {option.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 hover:text-green-600" />
                    )}
                  </button>

                  {/* Option Text */}
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(option.id, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />

                  {/* Remove Option */}
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(option.id)}
                      className="flex-shrink-0 text-gray-400 hover:text-red-600"
                      disabled={isLoading}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              Click the circle next to an option to mark it as the correct answer.
            </p>
          </div>
        )}

        {/* Short Answer */}
        {type === 'short-answer' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer *
            </label>
            <input
              type="text"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="Enter the correct answer..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid() || isLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Question</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Activity Card Component
const ActivityCard: React.FC<{
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
}> = ({ activity, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    onDelete(activity.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              activity.type === 'multiple-choice' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {activity.type === 'multiple-choice' ? 'Multiple Choice' : 'Short Answer'}
            </span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 leading-tight">
            {activity.question}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onEdit(activity)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Answer Options/Answer */}
      <div className="mt-4">
        {activity.type === 'multiple-choice' && activity.options ? (
          <div className="space-y-2">
            {activity.options.map((option, index) => (
              <div 
                key={option.id} 
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  option.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                }`}
              >
                {option.isCorrect ? (
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
                <span className={`text-sm ${
                  option.isCorrect ? 'text-green-800 font-medium' : 'text-gray-700'
                }`}>
                  {option.text}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-green-800 font-medium">
                Correct Answer: {activity.correctAnswer}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Question</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main ActivityTab Component
const ActivityTab: React.FC = () => {
  const { lectureId } = useLectureContext();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const firestore = getFirestore();

  // Fetch activities
  useEffect(() => {
    if (lectureId) {
      fetchActivities();
    }
  }, [lectureId]);

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
      setSubmitStatus({
        type: 'error',
        message: 'Failed to load activities. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveActivity = async (activityData: Omit<Activity, 'id'>) => {
    if (!lectureId) return;

    setFormLoading(true);
    try {
      if (editingActivity) {
        // Update existing activity
        const docRef = doc(firestore, 'lectures', lectureId, 'activities', editingActivity.id);
        await updateDoc(docRef, {
          ...activityData,
          updatedAt: serverTimestamp()
        });

        // Update local state
        setActivities(prev => prev.map(activity => 
          activity.id === editingActivity.id 
            ? { ...activity, ...activityData }
            : activity
        ));

        setSubmitStatus({
          type: 'success',
          message: 'Question updated successfully!'
        });
      } else {
        // Add new activity
        const activitiesRef = collection(firestore, 'lectures', lectureId, 'activities');
        const docRef = await addDoc(activitiesRef, {
          ...activityData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Add to local state
        const newActivity: Activity = {
          id: docRef.id,
          ...activityData
        };
        setActivities(prev => [...prev, newActivity]);

        setSubmitStatus({
          type: 'success',
          message: 'Question added successfully!'
        });
      }

      // Close form and reset states
      setShowForm(false);
      setEditingActivity(null);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitStatus({ type: null, message: '' });
      }, 3000);

    } catch (error) {
      console.error('Error saving activity:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Failed to save question. Please try again.'
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!lectureId) return;

    try {
      const docRef = doc(firestore, 'lectures', lectureId, 'activities', activityId);
      await deleteDoc(docRef);

      // Remove from local state
      setActivities(prev => prev.filter(activity => activity.id !== activityId));

      setSubmitStatus({
        type: 'success',
        message: 'Question deleted successfully!'
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitStatus({ type: null, message: '' });
      }, 3000);

    } catch (error) {
      console.error('Error deleting activity:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Failed to delete question. Please try again.'
      });
    }
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingActivity(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
            <span className="text-lg text-gray-600">Loading activities...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Learning Activities</h2>
              <p className="text-gray-600">Create interactive questions to engage your students.</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {submitStatus.type && (
          <div className={`p-4 rounded-lg flex items-center space-x-3 ${
            submitStatus.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {submitStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <p className={`text-sm ${
              submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {submitStatus.message}
            </p>
          </div>
        )}

        {/* Activity Form */}
        {showForm && (
          <ActivityForm
            activity={editingActivity || undefined}
            onSave={handleSaveActivity}
            onCancel={handleCancelForm}
            isLoading={formLoading}
          />
        )}

        {/* Activities List */}
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onEdit={handleEditActivity}
                onDelete={handleDeleteActivity}
              />
            ))}
          </div>
        ) : (
          !showForm && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first learning activity to engage your students.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Question
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ActivityTab;