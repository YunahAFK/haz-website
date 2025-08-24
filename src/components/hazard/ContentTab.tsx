// src/components/hazard/ContentTab.tsx
import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLectureContext } from '../../pages/AdminCreateLecture';
import { useStatusMessage } from '../../hooks/useStatusMessage';
import { useImageUpload, UploadedImage } from '../../hooks/useImageUpload';
import { useFirestore } from '../../hooks/useFirestore';
import { StatusMessage } from '../common/StatusMessage';
import { ImageUploadPreview } from '../common/ImageUploadPreview';
import { FileUploadButton } from '../common/FileUploadButton';
import { FormInput } from '../common/FormInput';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface LectureData {
  title: string;
  description: string;
  image: string;
  content: string;
  images: string[];
  status: 'draft' | 'published';
  createdAt?: any;
  updatedAt?: any;
}

const ContentTab: React.FC = () => {
  const { 
    lectureId, 
    setActiveTab, 
    registerTabActions, 
    unregisterTabActions 
  } = useLectureContext();
  
  const [lectureData, setLectureData] = useState<LectureData>({
    title: '',
    description: '',
    image: '',
    content: '',
    images: [],
    status: 'draft'
  });
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { status, setStatusMessage, clearStatus } = useStatusMessage();
  const { updateDocument, getDocument } = useFirestore();
  
  const { validateFile, uploadToFirebase, getProgress } = useImageUpload({
    storagePath: 'lectures/content-images',
    onSuccess: (url) => {
      setLectureData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }));
    },
    onError: (error) => setStatusMessage('error', error, false)
  });

  // Fetch lecture data when component mounts
  useEffect(() => {
    if (lectureId) {
      fetchLectureData();
    }
  }, [lectureId]);

  // Register tab actions when component mounts
  useEffect(() => {
    if (!lectureId) return;

    const saveDraftAction = () => saveLecture('draft');
    const publishAction = () => saveLecture('published');

    registerTabActions({
      saveDraft: saveDraftAction,
      publish: publishAction
    });

    return () => unregisterTabActions();
  }, [lectureId, lectureData.content, lectureData.images, registerTabActions, unregisterTabActions]);

  const fetchLectureData = async () => {
    if (!lectureId) return;

    setIsLoading(true);
    try {
      const data = await getDocument('lectures', lectureId) as LectureData;
      
      if (data) {
        setLectureData({
          title: data.title || '',
          description: data.description || '',
          image: data.image || '',
          content: data.content || '',
          images: data.images || [],
          status: data.status || 'draft',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
        console.log('Lecture data loaded:', data);
      } else {
        setStatusMessage('error', 'Lecture not found.', false);
      }
    } catch (error) {
      console.error('Error fetching lecture data:', error);
      setStatusMessage('error', 'Failed to load lecture data.', false);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLecture = async (status: 'draft' | 'published') => {
    if (!lectureId) {
      throw new Error('No lecture ID available');
    }
    
    if (status === 'published' && (!lectureData.content || !lectureData.content.trim())) {
      setStatusMessage('error', 'Please add content before publishing.', false);
      throw new Error('Content is required for publishing');
    }
    
    try {
      await updateDocument('lectures', lectureId, {
        content: lectureData.content || '',
        images: lectureData.images || [],
        status
      });
      
      setLectureData(prev => ({ ...prev, status }));
      
      const message = status === 'published' 
        ? 'Lecture published successfully!' 
        : 'Draft saved successfully!';
      setStatusMessage('success', message);
      
    } catch (error) {
      console.error(`Error ${status === 'published' ? 'publishing' : 'saving'} lecture:`, error);
      const message = status === 'published'
        ? 'Failed to publish lecture. Please try again.'
        : 'Failed to save draft. Please try again.';
      setStatusMessage('error', message, false);
      throw error;
    }
  };

  const generateImageId = () => `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setStatusMessage('error', validationError, false);
        continue;
      }

      const imageId = generateImageId();
      
      setUploadedImages(prev => [...prev, {
        file,
        url: null,
        id: imageId,
        uploading: true
      }]);

      try {
        const downloadURL = await uploadToFirebase(file, imageId);
        
        setUploadedImages(prev => 
          prev.map(img => 
            img.id === imageId 
              ? { ...img, url: downloadURL, uploading: false }
              : img
          )
        );
      } catch (error) {
        setUploadedImages(prev => 
          prev.map(img => 
            img.id === imageId 
              ? { ...img, uploading: false, error: 'Upload failed' }
              : img
          )
        );
      }
    }

    event.target.value = '';
  };

  const removeImage = (imageId: string) => {
    const imageToRemove = uploadedImages.find(img => img.id === imageId);
    
    if (imageToRemove?.url) {
      setLectureData(prev => ({
        ...prev,
        images: prev.images.filter(url => url !== imageToRemove.url)
      }));
    }

    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleNextToActivity = async () => {
    // Auto-save content as draft before navigating
    if (lectureId && lectureData.content && lectureData.content.trim()) {
      try {
        await updateDocument('lectures', lectureId, {
          content: lectureData.content,
          images: lectureData.images || []
        });
        console.log('Content auto-saved before navigation');
      } catch (error) {
        console.error('Error auto-saving content:', error);
      }
    }
    
    setActiveTab('activity');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <LoadingSpinner message="Loading lecture data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Lecture Content</h2>
              <p className="text-gray-600">edit and manage your lecture content, images, and materials.</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                lectureData.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {lectureData.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
          
          {/* Lecture Info Display */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">{lectureData.title}</h3>
            <p className="text-sm text-gray-600">{lectureData.description}</p>
          </div>
        </div>

        <StatusMessage type={status.type} message={status.message} />

        <div className="space-y-6">
          <FormInput
            label="Lecture Content"
            value={lectureData.content}
            onChange={(value) => setLectureData(prev => ({ ...prev, content: value }))}
            type="textarea"
            rows={15}
            placeholder={`Tools to be added for creating lecture
- font heading tool
- add image tool
- visual guide lines for clear lecture separations
- ...`}
            required
          />

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Images
            </label>
            
            <FileUploadButton
              onFileSelect={handleFileSelect}
              multiple
              label="Upload Images"
              description="supported formats: JPG, PNG, GIF. maximum size: 5MB per image."
            />

            {/* Uploaded Images Preview */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedImages.map((image) => (
                  <ImageUploadPreview
                    key={image.id}
                    image={image}
                    progress={getProgress(image.id || 'default')}
                    onRemove={() => removeImage(image.id!)}
                    aspectRatio="square"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Navigation Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleNextToActivity}
              className="inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span>Next: Activity</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentTab;