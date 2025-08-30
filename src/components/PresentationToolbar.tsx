// src/components/PresentationToolbar.tsx
import React from 'react';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Maximize,
    Minimize,
    Settings,
    X,
    Monitor
} from 'lucide-react';

interface PresentationToolbarProps {
    currentSlide: number;
    totalSlides: number;
    isPlaying: boolean;
    isFullscreen: boolean;
    onPlay: () => void;
    onPause: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onToggleFullscreen: () => void;
    onSettings: () => void;
    onExit: () => void;
}

export const PresentationToolbar: React.FC<PresentationToolbarProps> = ({
    currentSlide,
    totalSlides,
    isPlaying,
    isFullscreen,
    onPlay,
    onPause,
    onPrevious,
    onNext,
    onToggleFullscreen,
    onSettings,
    onExit
}) => {
    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center space-x-2 z-50">
            <button
                onClick={onPrevious}
                disabled={currentSlide === 0}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <SkipBack className="w-4 h-4" />
            </button>

            <button
                onClick={isPlaying ? onPause : onPlay}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
            >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
                onClick={onNext}
                disabled={currentSlide === totalSlides - 1}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <SkipForward className="w-4 h-4" />
            </button>

            <div className="mx-4 text-white text-sm">
                {currentSlide + 1} / {totalSlides}
            </div>

            <button
                onClick={onSettings}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
            >
                <Settings className="w-4 h-4" />
            </button>

            <button
                onClick={onToggleFullscreen}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
            >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            <button
                onClick={onExit}
                className="p-2 text-white hover:bg-red-500 hover:bg-opacity-80 rounded ml-2"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};