// src/components/hazard/InfoTab.tsx - REFACTORED
import React, { useState, useEffect } from 'react';
import { ArrowRight, Loader2, Upload } from 'lucide-react';
import { useLectureContext } from '../../pages/AdminCreateLecture';
import { useStatusMessage } from '../../hooks/useStatusMessage';
import { UploadedImage } from '../../hooks/useImageUpload';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload';
import { useFirestore } from '../../hooks/useFirestore';
import { StatusMessage } from '../common/StatusMessage';
import { ImageUploadPreview } from '../common/ImageUploadPreview';
import { FileUploadButton } from '../common/FileUploadButton';
import { FormInput } from '../common/FormInput';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface LectureInfo {
  title: string;
  description: string;
  image: string;
}

const InfoTab: React.FC = () => {
  const {
    setLectureId,
    navigateToNextTab,
    isEditMode,
    lectureData,
    lectureId,
    setLectureData
  } = useLectureContext();

  const [lectureInfo, setLectureInfo] = useState<LectureInfo>({
    title: '',
    description: '',
    image: ''
  });
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const { status, setStatusMessage, clearStatus } = useStatusMessage();
  const { createDocument, updateDocument } = useFirestore();

  const { validateFile, uploadToCloudinary, getProgress } = useCloudinaryUpload({
    cloudName: "dphrqp6a3",
    uploadPreset: "haz-image-upload",
    onSuccess: (url) => {
      const updatedInfo = { ...lectureInfo, image: url };
      setLectureInfo(updatedInfo);
      if (isEditMode && lectureData) {
        setLectureData({ image: url });
      }
      clearStatus();
    },
    onError: (error) => setStatusMessage('error', error, false),
  });


  // Pre-load data in edit mode
  useEffect(() => {
    if (isEditMode && lectureData && !isDataLoaded) {
      const newLectureInfo = {
        title: lectureData.title || '',
        description: lectureData.description || '',
        image: lectureData.image || ''
      };

      setLectureInfo(newLectureInfo);

      if (lectureData.image) {
        setUploadedImage({
          file: null,
          url: lectureData.image,
          uploading: false,
          isExisting: true
        });
      }

      setIsDataLoaded(true);
      clearStatus();
    }
  }, [isEditMode, lectureData, isDataLoaded, clearStatus]);

  // Reset data loaded flag when switching between lectures or modes
  useEffect(() => {
    if (!isEditMode || !lectureData) {
      setIsDataLoaded(false);
    }
  }, [isEditMode, lectureData, lectureId]);

  const handleInputChange = (field: keyof LectureInfo, value: string) => {
    setLectureInfo(prev => ({ ...prev, [field]: value }));

    if (isEditMode && lectureData) {
      setLectureData({ [field]: value });
    }

    if (status.type === 'error') clearStatus();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setStatusMessage('error', validationError, false);
      return;
    }

    setUploadedImage({
      file,
      url: null,
      uploading: true,
      isExisting: false
    });

    try {
      await uploadToCloudinary(file);
      setUploadedImage(prev => prev ? { ...prev, uploading: false } : null);
    } catch (error) {
      setUploadedImage(prev => prev ? {
        ...prev,
        uploading: false,
        error: 'Upload failed'
      } : null);
    }

    event.target.value = '';
  };

  const removeImage = () => {
    setUploadedImage(null);
    const updatedInfo = { ...lectureInfo, image: '' };
    setLectureInfo(updatedInfo);

    if (isEditMode && lectureData) {
      setLectureData({ image: '' });
    }
  };

  const validateForm = (): string | null => {
    if (!lectureInfo.title.trim()) return 'Please enter a lecture title.';
    if (!lectureInfo.description.trim()) return 'Please enter a description.';
    if (uploadedImage?.uploading) return 'Please wait for the image to finish uploading.';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setStatusMessage('error', validationError, false);
      return;
    }

    setIsSubmitting(true);
    clearStatus();

    try {
      if (isEditMode && lectureId) {
        await updateDocument('lectures', lectureId, lectureInfo);
        setLectureData(lectureInfo);
        setStatusMessage('success', 'Lecture info updated successfully!');
      } else {
        const docId = await createDocument('lectures', {
          ...lectureInfo,
          status: 'draft'
        });
        setLectureId(docId);
        setStatusMessage('success', 'Lecture info saved successfully!');
      }

      setTimeout(() => navigateToNextTab(), 1500);
    } catch (error) {
      console.error('Error saving lecture info:', error);
      setStatusMessage('error',
        isEditMode
          ? 'Failed to update lecture info. Please try again.'
          : 'Failed to save lecture info. Please try again.',
        false
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while data is being loaded in edit mode
  if (isEditMode && lectureData && !isDataLoaded) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <LoadingSpinner message="Loading Lecture Information..." />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {isEditMode ? 'Edit Lecture Information' : 'Lecture Information'}
          </h2>
          <p className="text-gray-600">
            enter the basic information about your lecture.
          </p>
        </div>

        <StatusMessage type={status.type} message={status.message} />

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          <FormInput
            label="Lecture Title"
            value={lectureInfo.title}
            onChange={(value) => handleInputChange('title', value)}
            placeholder="enter lecture title..."
            required
          />

          <FormInput
            label="Description"
            value={lectureInfo.description}
            onChange={(value) => handleInputChange('description', value)}
            type="textarea"
            placeholder="enter a brief description of the lecture..."
            required
          />

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>

            {!uploadedImage ? (
              <FileUploadButton
                onFileSelect={handleFileSelect}
                label="Upload Cover Image"
                description="supported formats: JPG, PNG, GIF. maximum size: 5MB."
              />
            ) : (
              <div className="mb-4">
                <ImageUploadPreview
                  image={uploadedImage}
                  progress={getProgress(uploadedImage.id || 'default')}
                  onRemove={removeImage}
                  aspectRatio="video"
                  className="max-w-md"
                />

                {!uploadedImage.uploading && (
                  <label className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-100 transition-colors mt-2">
                    <Upload className="w-3 h-3 mr-1 text-gray-600" />
                    <span className="text-gray-700">Replace Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? (
                isEditMode ? 'Updating...' : 'Creating Lecture...'
              ) : (
                isEditMode ? 'Update & Continue' : 'Next: Content'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InfoTab;