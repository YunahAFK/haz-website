// src/components/hazard/LectureTab.tsx
import React, { useState } from 'react';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Save, 
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
  serverTimestamp 
} from 'firebase/firestore';

interface LectureData {
  title: string;
  description: string;
  content: string;
  images: string[];
  createdAt?: any;
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

const LectureTab: React.FC = () => {
  const [lectureData, setLectureData] = useState<LectureData>({
    title: '',
    description: '',
    content: '',
    images: []
  });

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const storage = getStorage();
  const firestore = getFirestore();

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
      const storageRef = ref(storage, `lectures/images/${imageId}_${file.name}`);
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

  const handleSubmit = async () => {
    if (!lectureData.title.trim()) {
      setSubmitStatus({
        type: 'error',
        message: 'Please enter a lecture title.'
      });
      return;
    }

    if (!lectureData.content.trim()) {
      setSubmitStatus({
        type: 'error',
        message: 'Please enter lecture content.'
      });
      return;
    }

    const stillUploading = uploadedImages.some(img => img.uploading);
    if (stillUploading) {
      setSubmitStatus({
        type: 'error',
        message: 'Please wait for all images to finish uploading.'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const docRef = await addDoc(collection(firestore, 'lectures'), {
        ...lectureData,
        createdAt: serverTimestamp()
      });

      console.log('Lecture created with ID:', docRef.id);

      setSubmitStatus({
        type: 'success',
        message: 'Lecture created successfully!'
      });

      setLectureData({
        title: '',
        description: '',
        content: '',
        images: []
      });
      setUploadedImages([]);

    } catch (error) {
      console.error('Error creating lecture:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Failed to create lecture. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Create New Lecture</h2>
          <p className="text-gray-600">add educational content, images, and materials for your lecture.</p>
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
              value={lectureData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="enter lecture title..."
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={lectureData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="brief description of the lecture..."
            />
          </div>

          {/* Content Input */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Lecture Content *
            </label>
            <textarea
              id="content"
              value={lectureData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              placeholder="enter your lecture content here..."
              required
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
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
                supported formats: JPG, PNG, GIF. maximum size: 5MB per image.
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
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? 'Creating Lecture...' : 'Create Lecture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LectureTab;