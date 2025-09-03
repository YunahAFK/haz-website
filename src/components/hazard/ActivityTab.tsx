// src/components/hazard/ActivityTab.tsx - REFACTORED
import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save, Loader2 } from 'lucide-react';
import { useLectureContext } from '../../pages/AdminCreateLecture';
import { useActivities } from '../../hooks/useActivities';
import { Activity } from '../../types/(LectureDetail)/activity';
import { useActivityForm } from '../../hooks/useActivityForm';
import { useStatusMessage } from '../../hooks/useStatusMessage';
import { StatusMessage } from '../common/StatusMessage';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { FormInput } from '../common/FormInput';
import { MultipleChoiceOptions } from '../activity/MultipleChoiceOptions';
import { ActivityPreview } from '../activity/ActivityPreview';

// Activity Form Component
const ActivityForm: React.FC<{
  activity?: Activity;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}> = ({ activity, onSave, onCancel, isLoading = false }) => {
  const {
    type,
    setType,
    question,
    setQuestion,
    options,
    correctAnswer,
    setCorrectAnswer,
    addOption,
    removeOption,
    updateOption,
    setCorrectOption,
    isValid,
    getFormData
  } = useActivityForm(activity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid()) return;
    await onSave(getFormData());
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

        <FormInput
          label="Question"
          value={question}
          onChange={setQuestion}
          type="textarea"
          rows={3}
          placeholder="Enter your question here..."
          required
        />

        {/* Multiple Choice Options */}
        {type === 'multiple-choice' && (
          <MultipleChoiceOptions
            options={options}
            onUpdateOption={updateOption}
            onSetCorrectOption={setCorrectOption}
            onRemoveOption={removeOption}
            onAddOption={addOption}
            disabled={isLoading}
          />
        )}

        {/* Short Answer */}
        {type === 'short-answer' && (
          <FormInput
            label="Correct Answer"
            value={correctAnswer}
            onChange={setCorrectAnswer}
            placeholder="Enter the correct answer..."
            required
          />
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

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        {/* Question Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${activity.type === 'multiple-choice'
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

        <ActivityPreview activity={activity} />
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onDelete(activity.id);
          setShowDeleteConfirm(false);
        }}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete"
      />
    </>
  );
};

// Main ActivityTab Component
const ActivityTab: React.FC = () => {
  const { lectureId } = useLectureContext();
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const { activities, isLoading, saveActivity, deleteActivity } = useActivities(lectureId);
  const { status, setStatusMessage, clearStatus } = useStatusMessage();

  const handleSaveActivity = async (activityData: any) => {
    setFormLoading(true);
    clearStatus();

    try {
      const message = await saveActivity(activityData, editingActivity?.id);
      setStatusMessage('success', message);
      setShowForm(false);
      setEditingActivity(null);
    } catch (error: any) {
      setStatusMessage('error', error.message, false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      const message = await deleteActivity(activityId);
      setStatusMessage('success', message);
    } catch (error: any) {
      setStatusMessage('error', error.message, false);
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
          <LoadingSpinner message="Loading Activities..." />
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
              <p className="text-gray-600">create interactive questions to engage your students.</p>
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

        <StatusMessage type={status.type} message={status.message} />

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
            <EmptyState
              icon={<Plus className="w-8 h-8 text-gray-400" />}
              title="No Activities Yet"
              description="create your first learning activity to engage your students."
              action={{
                label: "Add Your First Question",
                onClick: () => setShowForm(true)
              }}
            />
          )
        )}
      </div>
    </div>
  );
};

export default ActivityTab;