// src/components/PresentationMode.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Slide, PresentationSettings } from '../types/presentation';
import { SlideRenderer } from './SlideRenderer';
import { PresentationToolbar } from './PresentationToolbar';
import { PresentationSettings as SettingsModal } from './PresentationSettings';

interface PresentationModeProps {
    slides: Slide[];
    onExit: () => void;
    onActivityAnswer?: (activityId: string, answer: string | number) => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
    slides,
    onExit,
    onActivityAnswer
}) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState<PresentationSettings>({
        autoAdvance: false,
        slideInterval: 5,
        showNotes: false,
        theme: 'light'
    });

    // Auto-advance functionality
    useEffect(() => {
        if (isPlaying && settings.autoAdvance) {
            const interval = setInterval(() => {
                setCurrentSlide(prev => {
                    if (prev < slides.length - 1) {
                        return prev + 1;
                    } else {
                        setIsPlaying(false);
                        return prev;
                    }
                });
            }, settings.slideInterval * 1000);

            return () => clearInterval(interval);
        }
    }, [isPlaying, settings.autoAdvance, settings.slideInterval, slides.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    nextSlide();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    previousSlide();
                    break;
                case 'Escape':
                    if (isFullscreen) {
                        exitFullscreen();
                    } else {
                        onExit();
                    }
                    break;
                case 'f':
                case 'F':
                    toggleFullscreen();
                    break;
                case 'p':
                case 'P':
                    setIsPlaying(!isPlaying);
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [currentSlide, slides.length, isFullscreen, isPlaying]);

    const nextSlide = useCallback(() => {
        setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
    }, [slides.length]);

    const previousSlide = useCallback(() => {
        setCurrentSlide(prev => Math.max(prev - 1, 0));
    }, []);

    const toggleFullscreen = () => {
        if (!isFullscreen) {
            document.documentElement.requestFullscreen?.();
            setIsFullscreen(true);
        } else {
            exitFullscreen();
        }
    };

    const exitFullscreen = () => {
        document.exitFullscreen?.();
        setIsFullscreen(false);
    };

    const handleActivityAnswer = (answer: string | number) => {
        const currentSlideData = slides[currentSlide];
        if (currentSlideData.activity && onActivityAnswer) {
            onActivityAnswer(currentSlideData.activity.id, answer);
        }
        // Auto-advance after activity
        setTimeout(() => {
            nextSlide();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-40">
            <div className="w-full h-full">
                <SlideRenderer
                    slide={slides[currentSlide]}
                    theme={settings.theme}
                    onActivityAnswer={handleActivityAnswer}
                />
            </div>

            <PresentationToolbar
                currentSlide={currentSlide}
                totalSlides={slides.length}
                isPlaying={isPlaying}
                isFullscreen={isFullscreen}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onPrevious={previousSlide}
                onNext={nextSlide}
                onToggleFullscreen={toggleFullscreen}
                onSettings={() => setShowSettings(true)}
                onExit={onExit}
            />

            {showSettings && (
                <SettingsModal
                    settings={settings}
                    onSettingsChange={setSettings}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </div>
    );
};
