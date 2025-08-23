import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Activity, CheckCircle, Presentation, ChevronLeft, ChevronRight, Maximize2, Users, LucideIcon } from 'lucide-react';

// Type definitions
interface Section {
    id: string;
    title: string;
    icon: LucideIcon;
    color: 'blue' | 'green' | 'purple';
}

interface PresentationModeProps {
    currentSection: number;
    setCurrentSection: (index: number) => void;
    sections: Section[];
    lectureTitle: string;
    courseTitle: string;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    onExitPresentation: () => void;
}

// Main LectureDetails Component
const LectureDetails = () => {
    const navigate = useNavigate();
    const [isPresentationMode, setIsPresentationMode] = useState(false);
    const [currentSection, setCurrentSection] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const lectureTitle = "Introduction to React Hooks";
    const courseTitle = "Advanced React Development";

    const sections: Section[] = [
        { id: 'lecture', title: 'Lecture Content', icon: BookOpen, color: 'blue' },
        { id: 'activity', title: 'Interactive Activity', icon: Activity, color: 'green' },
        { id: 'quiz', title: 'Final Quiz', icon: CheckCircle, color: 'purple' }
    ];

    // Fullscreen functions
    const toggleFullscreen = async (): Promise<void> => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (error) {
            console.error('Fullscreen error:', error);
        }
    };

    // Listen for fullscreen changes (when user presses ESC)
    React.useEffect(() => {
        const handleFullscreenChange = (): void => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    if (isPresentationMode) {
        return (
            <LecturePresentationMode
                currentSection={currentSection}
                setCurrentSection={setCurrentSection}
                sections={sections}
                lectureTitle={lectureTitle}
                courseTitle={courseTitle}
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
                onExitPresentation={() => setIsPresentationMode(false)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate(-1)}
                                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <p className="text-sm text-gray-500">{courseTitle}</p>
                                <h1 className="text-xl font-semibold text-gray-900">{lectureTitle}</h1>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsPresentationMode(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Presentation className="w-4 h-4" />
                            <span>Presentation Mode</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="space-y-8">
                    {/* Progress Indicator */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-900">Lecture Progress</h2>
                            <span className="text-sm text-gray-500">0/3 sections completed</span>
                        </div>
                        <div className="flex space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="text-sm text-gray-600">Lecture</span>
                            </div>
                            <div className="flex-1 h-0.5 bg-gray-200 self-center"></div>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Activity className="w-4 h-4 text-gray-400" />
                                </div>
                                <span className="text-sm text-gray-400">Activity</span>
                            </div>
                            <div className="flex-1 h-0.5 bg-gray-200 self-center"></div>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-gray-400" />
                                </div>
                                <span className="text-sm text-gray-400">Quiz</span>
                            </div>
                        </div>
                    </div>

                    {/* Lecture Section */}
                    <LectureSection />

                    {/* Activity Section */}
                    <ActivitySection />

                    {/* Quiz Section */}
                    <QuizSection />
                </div>
            </div>
        </div>
    );
};

// Presentation Mode Component
const LecturePresentationMode: React.FC<PresentationModeProps> = ({
    currentSection,
    setCurrentSection,
    sections,
    lectureTitle,
    courseTitle,
    isFullscreen,
    onToggleFullscreen,
    onExitPresentation
}) => {
    const goToSection = (index: number): void => {
        setCurrentSection(index);
    };

    const nextSection = (): void => {
        if (currentSection < sections.length - 1) {
            setCurrentSection(currentSection + 1);
        }
    };

    const prevSection = (): void => {
        if (currentSection > 0) {
            setCurrentSection(currentSection - 1);
        }
    };

    // Keyboard navigation for presentation
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (!isFullscreen) return; // Only work in fullscreen mode

            switch (event.key) {
                case 'ArrowRight':
                case ' ': // Spacebar
                    event.preventDefault();
                    nextSection();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    prevSection();
                    break;
                case 'Escape':
                    // Handled by fullscreen API
                    break;
                case 'f':
                case 'F':
                    event.preventDefault();
                    onToggleFullscreen();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSection, sections.length, isFullscreen]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Presentation Header */}
            <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-300 text-lg">{courseTitle}</p>
                            <h1 className="text-3xl font-bold text-white">{lectureTitle}</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-slate-300">
                                <Users className="w-5 h-5" />
                                <span>Presentation Mode</span>
                                {isFullscreen && (
                                    <span className="px-2 py-1 bg-green-600/20 text-green-300 rounded text-xs">
                                        Fullscreen
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={onExitPresentation}
                                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
                            >
                                Exit Presentation
                            </button>
                            <button
                                onClick={onToggleFullscreen}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen (F)'}
                            >
                                <Maximize2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Navigation Bar */}
            <div className="bg-black/10 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-3">
                    <div className="flex items-center justify-center space-x-8">
                        {sections.map((section: Section, index: number) => {
                            const Icon = section.icon;
                            const isActive = currentSection === index;
                            const colorClasses: Record<Section['color'], string> = {
                                blue: isActive ? 'bg-blue-600 text-white' : 'bg-blue-600/20 text-blue-300',
                                green: isActive ? 'bg-green-600 text-white' : 'bg-green-600/20 text-green-300',
                                purple: isActive ? 'bg-purple-600 text-white' : 'bg-purple-600/20 text-purple-300'
                            };

                            return (
                                <button
                                    key={section.id}
                                    onClick={() => goToSection(index)}
                                    className={`flex items-center space-x-3 px-6 py-3 rounded-full transition-all duration-300 ${isActive ? 'scale-110 shadow-lg' : 'hover:scale-105'
                                        } ${colorClasses[section.color]}`}
                                >
                                    <Icon className="w-6 h-6" />
                                    <span className="text-lg font-medium">{section.title}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 max-w-7xl mx-auto px-6 py-8">
                <div className="relative">
                    {/* Section Content */}
                    {currentSection === 0 && <LecturePresentationSection />}
                    {currentSection === 1 && <ActivityPresentationSection />}
                    {currentSection === 2 && <QuizPresentationSection />}
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="bg-black/20 backdrop-blur-sm border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={prevSection}
                            disabled={currentSection === 0}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${currentSection === 0
                                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span>Previous</span>
                        </button>

                        <div className="text-center">
                            <p className="text-slate-300 text-lg">
                                Section {currentSection + 1} of {sections.length}
                            </p>
                            <div className="flex space-x-2 mt-2">
                                {sections.map((_: Section, index: number) => (
                                    <div
                                        key={index}
                                        className={`w-3 h-3 rounded-full transition-all ${index === currentSection ? 'bg-white scale-125' : 'bg-white/30'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={nextSection}
                            disabled={currentSection === sections.length - 1}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${currentSection === sections.length - 1
                                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                        >
                            <span>Next</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Lecture Section Component
const LectureSection: React.FC = () => {
    return (
        <section className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Lecture Content</h2>
                        <p className="text-sm text-gray-500">Read through the material and view examples</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Lecture Content</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        This section will contain the main lecture content including text, images,
                        code examples, and other educational materials from Firebase.
                    </p>
                </div>
            </div>
        </section>
    );
};

// Activity Section Component
const ActivitySection: React.FC = () => {
    return (
        <section className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Interactive Activity</h2>
                        <p className="text-sm text-gray-500">Complete the interactive tasks to test your understanding</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Activity</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        This section will contain interactive elements like multiple choice questions,
                        drag-and-drop exercises, code challenges, and other engaging activities.
                    </p>
                </div>
            </div>
        </section>
    );
};

// Quiz Section Component
const QuizSection: React.FC = () => {
    return (
        <section className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Final Quiz</h2>
                        <p className="text-sm text-gray-500">Test your knowledge with the final assessment</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Final Quiz</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        This section will contain quiz questions to assess learning outcomes.
                        Questions will be scored and provide feedback on performance.
                    </p>
                </div>
            </div>
        </section>
    );
};

// Lecture Section - Presentation Mode
const LecturePresentationSection: React.FC = () => {
    return (
        <div className="text-center py-12">
            <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-600/20 mb-6">
                    <BookOpen className="w-10 h-10 text-blue-400" />
                </div>
                <h2 className="text-5xl font-bold text-white mb-4">Lecture Content</h2>
                <p className="text-2xl text-slate-300 max-w-3xl mx-auto">
                    Main educational content with text, images, and examples
                </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 max-w-5xl mx-auto">
                <div className="text-center py-16">
                    <BookOpen className="w-24 h-24 text-slate-400 mx-auto mb-8" />
                    <h3 className="text-3xl font-bold text-white mb-6">Ready for Content</h3>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        This area will display lecture content optimized for classroom presentation.
                        Large fonts, high contrast, and clear visual hierarchy for easy reading from a distance.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Activity Section - Presentation Mode
const ActivityPresentationSection: React.FC = () => {
    return (
        <div className="text-center py-12">
            <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-600/20 mb-6">
                    <Activity className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-5xl font-bold text-white mb-4">Interactive Activity</h2>
                <p className="text-2xl text-slate-300 max-w-3xl mx-auto">
                    Engage the class with interactive exercises and demonstrations
                </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 max-w-5xl mx-auto">
                <div className="text-center py-16">
                    <Activity className="w-24 h-24 text-slate-400 mx-auto mb-8" />
                    <h3 className="text-3xl font-bold text-white mb-6">Interactive Learning</h3>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Activities designed for group participation. Large interactive elements,
                        clear instructions, and visual feedback suitable for classroom engagement.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Quiz Section - Presentation Mode
const QuizPresentationSection: React.FC = () => {
    return (
        <div className="text-center py-12">
            <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-600/20 mb-6">
                    <CheckCircle className="w-10 h-10 text-purple-400" />
                </div>
                <h2 className="text-5xl font-bold text-white mb-4">Assessment Quiz</h2>
                <p className="text-2xl text-slate-300 max-w-3xl mx-auto">
                    Test understanding with classroom-friendly quiz questions
                </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 max-w-5xl mx-auto">
                <div className="text-center py-16">
                    <CheckCircle className="w-24 h-24 text-slate-400 mx-auto mb-8" />
                    <h3 className="text-3xl font-bold text-white mb-6">Knowledge Assessment</h3>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Quiz questions optimized for group discussion and learning assessment.
                        Large text, clear options, and results visible to the entire class.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LectureDetails;