// src/components/hazard/InfoTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';

import { useLectureContext } from '../../pages/AdminCreateLecture';

interface LectureInfo {
  title: string;
  description: string;
  image: string;
}

interface UploadedImage {
  file: File | null;
  url: string | null;
  uploading: boolean;
  error?: string;
  isExisting?: boolean; // Flag to indicate if this is an existing image from edit mode
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
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const storage = getStorage();
  const firestore = getFirestore();

  // Pre-load data in edit mode
  useEffect(() => {
    if (isEditMode && lectureData && !isDataLoaded) {
      console.log('Pre-loading lecture data in InfoTab:', lectureData);
      
      const newLectureInfo = {
        title: lectureData.title || '',
        description: lectureData.description || '',
        image: lectureData.image || ''
      };
      
      setLectureInfo(newLectureInfo);
      
      // If there's an existing image, set it up
      if (lectureData.image) {
        setUploadedImage({
          file: null,
          url: lectureData.image,
          uploading: false,
          isExisting: true
        });
      }
      
      setIsDataLoaded(true);
      
      // Clear any previous status messages when loading edit data
      setSubmitStatus({ type: null, message: '' });
    }
  }, [isEditMode, lectureData, isDataLoaded]);

  // Reset data loaded flag when switching between lectures or modes
  useEffect(() => {
    if (!isEditMode || !lectureData) {
      setIsDataLoaded(false);
    }
  }, [isEditMode, lectureData, lectureId]);

  const handleInputChange = (field: keyof LectureInfo, value: string) => {
    setLectureInfo(prev => {
      const updated = { ...prev, [field]: value };
      
      // Update context data if in edit mode
      if (isEditMode && lectureData) {
        setLectureData({ [field]: value });
      }
      
      return updated;
    });
    
    // Clear any existing error messages when user starts editing
    if (submitStatus.type === 'error') {
      setSubmitStatus({ type: null, message: '' });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

    setUploadedImage({
      file,
      url: null,
      uploading: true,
      isExisting: false
    });

    uploadImageToFirebase(file);
    event.target.value = '';
  };

  const uploadImageToFirebase = async (file: File) => {
    try {
      const storageRef = ref(storage, `lectures/covers/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setUploadedImage(prev => prev ? {
            ...prev,
            uploading: false,
            error: 'Upload failed'
          } : null);
          setUploadProgress(0);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            setUploadedImage(prev => prev ? {
              ...prev,
              url: downloadURL,
              uploading: false,
              isExisting: false
            } : null);

            const updatedInfo = { ...lectureInfo, image: downloadURL };
            setLectureInfo(updatedInfo);

            // Update context data if in edit mode
            if (isEditMode && lectureData) {
              setLectureData({ image: downloadURL });
            }

            setUploadProgress(0);
            
            // Clear any error messages after successful upload
            setSubmitStatus({ type: null, message: '' });

          } catch (error) {
            console.error('Error getting download URL:', error);
            setUploadedImage(prev => prev ? {
              ...prev,
              uploading: false,
              error: 'Failed to get download URL'
            } : null);
          }
        }
      );

    } catch (error) {
      console.error('Error starting upload:', error);
      setUploadedImage(prev => prev ? {
        ...prev,
        uploading: false,
        error: 'Failed to start upload'
      } : null);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    const updatedInfo = { ...lectureInfo, image: '' };
    setLectureInfo(updatedInfo);
    
    // Update context data if in edit mode
    if (isEditMode && lectureData) {
      setLectureData({ image: '' });
    }
    
    setUploadProgress(0);
  };

  const handleSubmit = async () => {
    if (!lectureInfo.title.trim()) {
      setSubmitStatus({
        type: 'error',
        message: 'Please enter a lecture title.'
      });
      return;
    }

    if (!lectureInfo.description.trim()) {
      setSubmitStatus({
        type: 'error',
        message: 'Please enter a description.'
      });
      return;
    }

    if (uploadedImage?.uploading) {
      setSubmitStatus({
        type: 'error',
        message: 'Please wait for the image to finish uploading.'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      if (isEditMode && lectureId) {
        // Update existing lecture
        await updateDoc(doc(firestore, 'lectures', lectureId), {
          title: lectureInfo.title,
          description: lectureInfo.description,
          image: lectureInfo.image,
          updatedAt: serverTimestamp()
        });

        console.log('Lecture info updated for ID:', lectureId);
        
        // Update context data
        setLectureData({
          title: lectureInfo.title,
          description: lectureInfo.description,
          image: lectureInfo.image
        });

        setSubmitStatus({
          type: 'success',
          message: 'Lecture info updated successfully!'
        });
        
      } else {
        // Create new lecture
        const docRef = await addDoc(collection(firestore, 'lectures'), {
          title: lectureInfo.title,
          description: lectureInfo.description,
          image: lectureInfo.image,
          status: 'draft',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        console.log('Lecture created with ID:', docRef.id);
        
        // Store the lecture ID in context
        setLectureId(docRef.id);

        setSubmitStatus({
          type: 'success',
          message: 'Lecture info saved successfully!'
        });
      }

      // Auto-navigate to next tab after a short delay
      setTimeout(() => {
        navigateToNextTab();
      }, 1500);

    } catch (error) {
      console.error('Error saving lecture info:', error);
      setSubmitStatus({
        type: 'error',
        message: isEditMode 
          ? 'Failed to update lecture info. Please try again.'
          : 'Failed to save lecture info. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while data is being loaded in edit mode
  if (isEditMode && lectureData && !isDataLoaded) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading Lecture Information...</p>
            </div>
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {isEditMode ? 'Edit Lecture Information' : 'Lecture Information'}
          </h2>
          <p className="text-gray-600">
            {isEditMode 
              ? 'enter the basic information about your lecture.'
              : 'enter the basic information about your lecture.'
            }
          </p>
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

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Lecture Title *
            </label>
            <input
              type="text"
              id="title"
              value={lectureInfo.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter lecture title..."
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={lectureInfo.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter a brief description of the lecture..."
              required
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            
            {!uploadedImage ? (
              <div className="mb-4">
                <label className="inline-flex items-center px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <Upload className="w-4 h-4 mr-2 text-gray-600" />
                  <span className="text-sm text-gray-700">Upload Cover Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  supported formats: JPG, PNG, GIF. maximum size: 5MB.
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <div className="relative bg-gray-50 rounded-lg border border-gray-200 p-4 max-w-md">
                  {/* Image Preview */}
                  <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {uploadedImage.url ? (
                      <img
                        src={uploadedImage.url}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="text-sm text-gray-600 mb-2 truncate">
                    {uploadedImage.file ? uploadedImage.file.name : (
                      uploadedImage.isExisting ? 'Existing cover image' : 'Uploaded image'
                    )}
                  </div>

                  {/* Upload Progress */}
                  {uploadedImage.uploading && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Uploading...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {uploadedImage.error && (
                    <div className="text-xs text-red-600 mb-2">
                      {uploadedImage.error}
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  {/* Upload Status Indicator */}
                  {!uploadedImage.uploading && !uploadedImage.error && uploadedImage.url && (
                    <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3" />
                    </div>
                  )}
                </div>
                
                {/* Replace Image Button */}
                {!uploadedImage.uploading && (
                  <label className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-100 transition-colors mt-2">
                    <Upload className="w-3 h-3 mr-1 text-gray-600" />
                    <span className="text-gray-700">
                      {uploadedImage.isExisting ? 'Replace Image' : 'Replace Image'}
                    </span>
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