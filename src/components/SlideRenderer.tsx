// src/components/SlideRenderer.tsx
import React from 'react';
import { Slide } from '../types/presentation';
import { ActivityComponent } from './lecture/user/ActivityComponent';

interface SlideRendererProps {
    slide: Slide;
    theme: string;
    onActivityAnswer?: (answer: string | number) => void;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({
    slide,
    theme,
    onActivityAnswer
}) => {
    const getThemeClasses = () => {
        switch (theme) {
            case 'dark':
                return 'bg-gray-900 text-white';
            case 'blue':
                return 'bg-gradient-to-br from-blue-600 to-blue-800 text-white';
            default:
                return 'bg-white text-gray-900';
        }
    };

    const renderSlideContent = () => {
        switch (slide.type) {
            case 'title':
                return (
                    <div className="text-center">
                        <h1 className="text-6xl font-bold mb-8 leading-tight">
                            {slide.title}
                        </h1>
                        {slide.content && (
                            <p className="text-2xl opacity-80 max-w-4xl mx-auto leading-relaxed">
                                {slide.content}
                            </p>
                        )}
                    </div>
                );

            case 'content':
                return (
                    <div>
                        <h2 className="text-4xl font-bold mb-8 text-center">
                            {slide.title}
                        </h2>
                        <div
                            className="prose prose-xl max-w-none prose-headings:text-current prose-p:text-current prose-li:text-current"
                            dangerouslySetInnerHTML={{ __html: slide.content || '' }}
                        />
                    </div>
                );

            case 'image':
                return (
                    <div className="text-center">
                        <h2 className="text-4xl font-bold mb-8">
                            {slide.title}
                        </h2>
                        <div className="max-h-[70vh] flex items-center justify-center">
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                            />
                        </div>
                    </div>
                );

            case 'activity':
                return (
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-4xl font-bold mb-8 text-center">
                            {slide.title}
                        </h2>
                        {slide.activity && onActivityAnswer && (
                            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8">
                                <ActivityComponent
                                    activity={slide.activity}
                                    onAnswer={onActivityAnswer}
                                />
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className={`w-full h-full flex items-center justify-center p-12 ${getThemeClasses()}`}>
            <div className="w-full max-w-6xl">
                {renderSlideContent()}
            </div>
        </div>
    );
};