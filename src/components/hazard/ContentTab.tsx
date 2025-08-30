// src/components/hazard/ContentTab.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import { useLectureContext } from '../../pages/AdminCreateLecture';
import { useStatusMessage } from '../../hooks/useStatusMessage';
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
  const [isLoading, setIsLoading] = useState(true);

  const { status, setStatusMessage, clearStatus } = useStatusMessage();
  const { updateDocument, getDocument } = useFirestore();

  // Quill editor configuration
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean'] // remove formatting button
      ]
    },
    clipboard: {
      matchVisual: false
    }
  }), []);

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'list', 'bullet', 'indent',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  // Custom styles for the Quill editor
  const editorStyles = `
    .ql-editor {
      min-height: 300px;
      font-size: 14px;
      line-height: 1.6;
    }
    
    .ql-toolbar {
      border-top: 1px solid #ccc;
      border-left: 1px solid #ccc;
      border-right: 1px solid #ccc;
      border-radius: 8px 8px 0 0;
    }
    
    .ql-container {
      border-bottom: 1px solid #ccc;
      border-left: 1px solid #ccc;
      border-right: 1px solid #ccc;
      border-radius: 0 0 8px 8px;
    }

    .ql-editor.ql-blank::before {
      color: #9ca3af;
      font-style: italic;
    }
  `;

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
  }, [lectureId, lectureData.title, lectureData.content, lectureData.images, registerTabActions, unregisterTabActions]);

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
    
    if (status === 'published' && (!lectureData.title || !lectureData.title.trim())) {
      setStatusMessage('error', 'Please add a title before publishing.', false);
      throw new Error('Title is required for publishing');
    }
    
    if (status === 'published' && (!lectureData.content || !lectureData.content.trim() || lectureData.content === '<p><br></p>')) {
      setStatusMessage('error', 'Please add content before publishing.', false);
      throw new Error('Content is required for publishing');
    }
    
    try {
      await updateDocument('lectures', lectureId, {
        title: lectureData.title || '',
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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    
    // TODO: Implement image upload logic
    // You'll want to upload to your storage service and get URLs back
    // Then add those URLs to lectureData.images
    
    event.target.value = '';
  };

  const handleNextToActivity = async () => {
    // Auto-save content as draft before navigating
    if (lectureId && (lectureData.title.trim() || (lectureData.content.trim() && lectureData.content !== '<p><br></p>'))) {
      try {
        await updateDocument('lectures', lectureId, {
          title: lectureData.title,
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
    <>
      {/* Add custom styles */}
      <style dangerouslySetInnerHTML={{ __html: editorStyles }} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Lecture Content</h2>
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
            {lectureData.description && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{lectureData.description}</p>
              </div>
            )}
          </div>

          <StatusMessage type={status.type} message={status.message} />

          <div className="space-y-6">
            {/* Title Field */}
            <FormInput
              label="Section Title"
              value={lectureData.title}
              onChange={(value) => setLectureData(prev => ({ ...prev, title: value }))}
              type="text"
              placeholder="Enter your lecture title..."
              required
            />

            {/* Rich Text Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Content
              </label>
              
              <div className="mb-2">
                <ReactQuill
                  value={lectureData.content}
                  onChange={(content) => setLectureData(prev => ({ ...prev, content }))}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Start writing your lecture content here..."
                  theme="snow"
                />
              </div>
              
              <p className="text-xs text-gray-500">
                Use the toolbar above to format your text. You can create headers, add emphasis, create lists, and more.
              </p>
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Images
              </label>
              
              <FileUploadButton
                onFileSelect={handleFileSelect}
                multiple
                label="Upload Images"
                description="Supported formats: JPG, PNG, GIF. Maximum size: 5MB per image."
              />
              
              {lectureData.images.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {lectureData.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Content image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = lectureData.images.filter((_, i) => i !== index);
                            setLectureData(prev => ({ ...prev, images: newImages }));
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Word Count */}
            {lectureData.content && (
              <div className="text-right">
                <span className="text-xs text-gray-500">
                  {lectureData.content.replace(/<[^>]*>/g, '').length} characters
                </span>
              </div>
            )}

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
    </>
  );
};

export default ContentTab;