// src/components/SlideGenerationModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Wand2, Split, List, Settings } from 'lucide-react';
import { Lecture, Activity } from '../types/lecture';
import { Slide } from '../types/presentation';
import { 
  parseContentToSlidesEnhanced,
  parseContentWithManualBreaks,
  parseContentWithConfig
} from '../utils/enhancedSlideParser';

interface SlideGenerationModalProps {
  lecture: Lecture;
  activities: Activity[];
  onSlidesGenerated: (slides: Slide[]) => void;
  onClose: () => void;
}

type ParseStrategy = 'smart' | 'manual' | 'custom' | 'simple';

interface CustomConfig {
  maxWordsPerSlide: number;
  minSlidesFromContent: number;
  maxSlidesFromContent: number;
  splitByParagraphs: boolean;
  splitByLists: boolean;
}

export const SlideGenerationModal: React.FC<SlideGenerationModalProps> = ({
  lecture,
  activities,
  onSlidesGenerated,
  onClose
}) => {
  const [strategy, setStrategy] = useState<ParseStrategy>('smart');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [customConfig, setCustomConfig] = useState<CustomConfig>({
    maxWordsPerSlide: 100,
    minSlidesFromContent: 3,
    maxSlidesFromContent: 10,
    splitByParagraphs: true,
    splitByLists: true
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSlides = async () => {
    setIsGenerating(true);
    try {
      let generatedSlides: Slide[] = [];

      switch (strategy) {
        case 'smart':
          generatedSlides = parseContentToSlidesEnhanced(lecture, activities);
          break;
        
        case 'manual':
          // Check if content has manual breaks
          const hasManualBreaks = [
            '---SLIDE---',
            '<!-- SLIDE -->',
            '[SLIDE]'
          ].some(marker => lecture.content.includes(marker));
          
          if (hasManualBreaks) {
            generatedSlides = parseContentWithManualBreaks(lecture.content);
            // Add title slide and activities
            generatedSlides.unshift({
              id: 'title',
              type: 'title',
              title: lecture.title,
              content: lecture.description
            });
            activities.forEach((activity, index) => {
              generatedSlides.push({
                id: `activity-${index}`,
                type: 'activity',
                title: `Activity ${index + 1}`,
                activity
              });
            });
          } else {
            // Fallback to smart parsing
            generatedSlides = parseContentToSlidesEnhanced(lecture, activities);
          }
          break;
        
        case 'custom':
          generatedSlides = parseContentWithConfig(lecture, activities, {
            maxWordsPerSlide: customConfig.maxWordsPerSlide,
            preferredBreakPoints: ['p', 'ul', 'ol', 'blockquote'],
            minSlidesFromContent: customConfig.minSlidesFromContent,
            maxSlidesFromContent: customConfig.maxSlidesFromContent
          });
          break;
        
        case 'simple':
          // Simple approach - just break content into equal parts
          generatedSlides = createSimpleSlides(lecture, activities);
          break;
      }

      setSlides(generatedSlides);
    } catch (error) {
      console.error('Error generating slides:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const createSimpleSlides = (lecture: Lecture, activities: Activity[]): Slide[] => {
    const slides: Slide[] = [];
    
    // Title slide
    slides.push({
      id: 'title',
      type: 'title',
      title: lecture.title,
      content: lecture.description
    });

    // Split content into 4-6 slides
    const parser = new DOMParser();
    const doc = parser.parseFromString(lecture.content, 'text/html');
    const allText = doc.body.textContent || '';
    const words = allText.split(/\s+/);
    const targetSlides = Math.min(Math.max(Math.ceil(words.length / 150), 3), 6);
    const wordsPerSlide = Math.ceil(words.length / targetSlides);
    
    for (let i = 0; i < targetSlides; i++) {
      const startWord = i * wordsPerSlide;
      const endWord = Math.min(startWord + wordsPerSlide, words.length);
      const slideWords = words.slice(startWord, endWord);
      
      slides.push({
        id: `slide-${i + 1}`,
        type: 'content',
        title: `Part ${i + 1}`,
        content: `<p>${slideWords.join(' ')}</p>`
      });
    }

    // Add activities
    activities.forEach((activity, index) => {
      slides.push({
        id: `activity-${index}`,
        type: 'activity',
        title: `Activity ${index + 1}`,
        activity
      });
    });

    return slides;
  };

  useEffect(() => {
    generateSlides();
  }, [strategy, customConfig]);

  const handleGenerate = () => {
    if (slides.length > 0) {
      onSlidesGenerated(slides);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Generate Presentation Slides</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[70vh]">
          {/* Left Panel - Options */}
          <div className="w-1/3 p-6 border-r bg-gray-50 overflow-y-auto">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Slide Generation Method</h3>
              
              <div className="space-y-2">
                <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-white transition-colors">
                  <input
                    type="radio"
                    name="strategy"
                    value="smart"
                    checked={strategy === 'smart'}
                    onChange={(e) => setStrategy(e.target.value as ParseStrategy)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="flex items-center">
                      <Wand2 className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="font-medium">Smart Auto-Split</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Automatically detects headings and natural break points
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-white transition-colors">
                  <input
                    type="radio"
                    name="strategy"
                    value="manual"
                    checked={strategy === 'manual'}
                    onChange={(e) => setStrategy(e.target.value as ParseStrategy)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="flex items-center">
                      <Split className="w-4 h-4 mr-2 text-green-600" />
                      <span className="font-medium">Manual Breaks</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Uses ---SLIDE--- or [SLIDE] markers in your content
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-white transition-colors">
                  <input
                    type="radio"
                    name="strategy"
                    value="simple"
                    checked={strategy === 'simple'}
                    onChange={(e) => setStrategy(e.target.value as ParseStrategy)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="flex items-center">
                      <List className="w-4 h-4 mr-2 text-purple-600" />
                      <span className="font-medium">Equal Parts</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Splits content into 4-6 equal slides
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-white transition-colors">
                  <input
                    type="radio"
                    name="strategy"
                    value="custom"
                    checked={strategy === 'custom'}
                    onChange={(e) => setStrategy(e.target.value as ParseStrategy)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="flex items-center">
                      <Settings className="w-4 h-4 mr-2 text-orange-600" />
                      <span className="font-medium">Custom Settings</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Configure your own splitting parameters
                    </p>
                  </div>
                </label>
              </div>

              {/* Custom Config Options */}
              {strategy === 'custom' && (
                <div className="space-y-4 mt-6 p-4 bg-white rounded-lg border">
                  <h4 className="font-medium">Custom Settings</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max words per slide
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="300"
                      value={customConfig.maxWordsPerSlide}
                      onChange={(e) => setCustomConfig(prev => ({
                        ...prev,
                        maxWordsPerSlide: parseInt(e.target.value) || 100
                      }))}
                      className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum slides from content
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={customConfig.minSlidesFromContent}
                      onChange={(e) => setCustomConfig(prev => ({
                        ...prev,
                        minSlidesFromContent: parseInt(e.target.value) || 3
                      }))}
                      className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum slides from content
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="50"
                      value={customConfig.maxSlidesFromContent}
                      onChange={(e) => setCustomConfig(prev => ({
                        ...prev,
                        maxSlidesFromContent: parseInt(e.target.value) || 10
                      }))}
                      className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Manual Break Instructions */}
              {strategy === 'manual' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Manual Break Markers</h4>
                  <p className="text-sm text-blue-800 mb-2">
                    Add these markers in your content where you want slides to break:
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li><code>---SLIDE---</code></li>
                    <li><code>[SLIDE]</code></li>
                    <li><code>&lt;!-- SLIDE --&gt;</code></li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">
                Preview ({slides.length} slides)
              </h3>
              <button
                onClick={generateSlides}
                disabled={isGenerating}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Regenerate'}
              </button>
            </div>

            <div className="space-y-3">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Slide {index + 1}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      slide.type === 'title' ? 'bg-purple-100 text-purple-700' :
                      slide.type === 'activity' ? 'bg-green-100 text-green-700' :
                      slide.type === 'image' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {slide.type}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    {slide.title}
                  </h4>
                  {slide.content && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {slide.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </p>
                  )}
                  {slide.activity && (
                    <p className="text-sm text-gray-600">
                      {slide.activity.question}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {slides.length} slides will be generated
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={slides.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Presentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};