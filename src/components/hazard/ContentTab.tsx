// src/components/hazard/ContentTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';
import { 
  getFirestore, 
  doc, 
  getDoc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

import { useLectureContext } from '../../pages/AdminCreateLecture';

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

interface UploadProgress {
  [key: string]: number;
}

interface UploadedImage {
  file: File;
  url: string | null;
  id: string;
  uploading: boolean;
  error?: string;
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
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [isLoading, setIsLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const storage = getStorage();
  const firestore = getFirestore();

  // Fetch lecture data when component mounts
  useEffect(() => {
    if (lectureId) {
      fetchLectureData();
    }
  }, [lectureId]);

  // Register tab actions when component mounts
  useEffect(() => {
    const saveDraftAction = async () => {
      if (!lectureId) {
        throw new Error('No lecture ID available');
      }
      
      try {
        const docRef = doc(firestore, 'lectures', lectureId);
        await updateDoc(docRef, {
          content: lectureData.content || '',
          images: lectureData.images || [],
          status: 'draft',
          updatedAt: serverTimestamp()
        });
        
        setSubmitStatus({
          type: 'success',
          message: 'Draft saved successfully!'
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSubmitStatus({ type: null, message: '' });
        }, 3000);
        
      } catch (error) {
        console.error('Error saving draft:', error);
        setSubmitStatus({
          type: 'error',
          message: 'Failed to save draft. Please try again.'
        });
        throw error;
      }
    };

    const publishAction = async () => {
      if (!lectureId) {
        throw new Error('No lecture ID available');
      }
      
      if (!lectureData.content || !lectureData.content.trim()) {
        setSubmitStatus({
          type: 'error',
          message: 'Please add content before publishing.'
        });
        throw new Error('Content is required for publishing');
      }
      
      try {
        const docRef = doc(firestore, 'lectures', lectureId);
        await updateDoc(docRef, {
          content: lectureData.content || '',
          images: lectureData.images || [],
          status: 'published',
          updatedAt: serverTimestamp()
        });
        
        // Update local state to reflect published status
        setLectureData(prev => ({
          ...prev,
          status: 'published'
        }));
        
        setSubmitStatus({
          type: 'success',
          message: 'Lecture published successfully!'
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSubmitStatus({ type: null, message: '' });
        }, 3000);
        
      } catch (error) {
        console.error('Error publishing lecture:', error);
        setSubmitStatus({
          type: 'error',
          message: 'Failed to publish lecture. Please try again.'
        });
        throw error;
      }
    };

    // Register actions with context
    registerTabActions({
      saveDraft: saveDraftAction,
      publish: publishAction
    });

    // Cleanup: unregister actions when component unmounts
    return () => {
      unregisterTabActions();
    };
  }, [lectureId, lectureData.content, lectureData.images, firestore, registerTabActions, unregisterTabActions]);

  const fetchLectureData = async () => {
    if (!lectureId) return;

    setIsLoading(true);
    try {
      const docRef = doc(firestore, 'lectures', lectureId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as LectureData;
        // Ensure all fields have default values
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
        setSubmitStatus({
          type: 'error',
          message: 'Lecture not found.'
        });
      }
    } catch (error) {
      console.error('Error fetching lecture data:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Failed to load lecture data.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LectureData, value: string) => {
    setLectureData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateImageId = () => `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        setSubmitStatus({
          type: 'error',
          message: `${file.name} is not a valid image file.`
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setSubmitStatus({
          type: 'error',
          message: `${file.name} is too large. Maximum size is 5MB.`
        });
        return;
      }

      const imageId = generateImageId();
      
      setUploadedImages(prev => [...prev, {
        file,
        url: null,
        id: imageId,
        uploading: true
      }]);

      uploadImageToFirebase(file, imageId);
    });

    event.target.value = '';
  };

  const uploadImageToFirebase = async (file: File, imageId: string) => {
    try {
      const storageRef = ref(storage, `lectures/content-images/${imageId}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(prev => ({
            ...prev,
            [imageId]: progress
          }));
        },
        (error) => {
          console.error('Upload error:', error);
          setUploadedImages(prev => 
            prev.map(img => 
              img.id === imageId 
                ? { ...img, uploading: false, error: 'Upload failed' }
                : img
            )
          );
          setUploadProgress(prev => {
            const { [imageId]: _, ...rest } = prev;
            return rest;
          });
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            setUploadedImages(prev => 
              prev.map(img => 
                img.id === imageId 
                  ? { ...img, url: downloadURL, uploading: false }
                  : img
              )
            );

            setUploadProgress(prev => {
              const { [imageId]: _, ...rest } = prev;
              return rest;
            });

            setLectureData(prev => ({
              ...prev,
              images: [...prev.images, downloadURL]
            }));

          } catch (error) {
            console.error('Error getting download URL:', error);
            setUploadedImages(prev => 
              prev.map(img => 
                img.id === imageId 
                  ? { ...img, uploading: false, error: 'Failed to get download URL' }
                  : img
              )
            );
          }
        }
      );

    } catch (error) {
      console.error('Error starting upload:', error);
      setUploadedImages(prev => 
        prev.map(img => 
          img.id === imageId 
            ? { ...img, uploading: false, error: 'Failed to start upload' }
            : img
        )
      );
    }
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
    
    setUploadProgress(prev => {
      const { [imageId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleNextToActivity = async () => {
    // Auto-save content as draft before navigating
    if (lectureId && lectureData.content && lectureData.content.trim()) {
      try {
        const docRef = doc(firestore, 'lectures', lectureId);
        await updateDoc(docRef, {
          content: lectureData.content,
          images: lectureData.images || [],
          updatedAt: serverTimestamp()
        });
        console.log('Content auto-saved before navigation');
      } catch (error) {
        console.error('Error auto-saving content:', error);
      }
    }
    
    // Navigate to activity tab
    setActiveTab('activity');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
            <span className="text-lg text-gray-600">Loading lecture data...</span>
          </div>
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
              <p className="text-gray-600">Edit and manage your lecture content, images, and materials.</p>
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

        {/* Status Messages */}
        {submitStatus.type && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
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

        <div className="space-y-6">
          {/* Content Input */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Lecture Content *
            </label>
            <textarea
              id="content"
              value={lectureData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              placeholder="Enter your lecture content here..."
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Images
            </label>
            
            {/* Upload Button */}
            <div className="mb-4">
              <label className="inline-flex items-center px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <Upload className="w-4 h-4 mr-2 text-gray-600" />
                <span className="text-sm text-gray-700">Upload Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPG, PNG, GIF. Maximum size: 5MB per image.
              </p>
            </div>

            {/* Uploaded Images Preview */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="relative bg-gray-50 rounded-lg border border-gray-200 p-3">
                    {/* Image Preview */}
                    <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                      {image.url ? (
                        <img
                          src={image.url}
                          alt="Uploaded"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="text-xs text-gray-600 mb-2 truncate">
                      {image.file.name}
                    </div>

                    {/* Upload Progress */}
                    {image.uploading && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Uploading...</span>
                          <span>{Math.round(uploadProgress[image.id] || 0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[image.id] || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {image.error && (
                      <div className="text-xs text-red-600 mb-2">
                        {image.error}
                      </div>
                    )}

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    {/* Upload Status Indicator */}
                    {!image.uploading && !image.error && image.url && (
                      <div className="absolute top-1 left-1 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                    )}
                  </div>
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