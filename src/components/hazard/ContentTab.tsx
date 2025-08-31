// src/components/hazard/ContentTab.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Layers } from 'lucide-react';
import { useLectureContext } from '../../pages/AdminCreateLecture';
import { useStatusMessage } from '../../hooks/useStatusMessage';
import { useFirestore } from '../../hooks/useFirestore';
import { StatusMessage } from '../common/StatusMessage';
import { LoadingSpinner } from '../common/LoadingSpinner';
import RichTextEditor, { RichTextEditorRef } from '../common/RichTextEditor';

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
  const editorRef = useRef<RichTextEditorRef>(null);

  const { status, setStatusMessage, clearStatus } = useStatusMessage();
  const { updateDocument, getDocument } = useFirestore();

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

  const handleContentChange = (content: string) => {
    setLectureData(prev => ({ ...prev, content }));
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    
    // TODO: Implement image upload logic
    // You'll want to upload to your storage service and get URLs back
    // then add those URLs to lectureData.images
    
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
          <LoadingSpinner message="Loading Lecture Data..." />
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
              <h2 className="text-2xl font-semibold text-gray-900">Lecture Content</h2>
            </div>
          </div>
        </div>

        <StatusMessage type={status.type} message={status.message} />

        <div className="space-y-6">
          {/* Rich Text Content Editor */}
          <div>
            <RichTextEditor
              ref={editorRef}
              value={lectureData.content}
              onChange={handleContentChange}
              placeholder="Start writing your lecture content here... use the slide separator tool to mark slide breaks."
              minHeight={300}
              showSlideSeparator={true}
            />
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
  );
};

export default ContentTab;