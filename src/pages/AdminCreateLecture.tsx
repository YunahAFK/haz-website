// src/pages/AdminCreateLecture.tsx
import React, { useState, createContext, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/layout/Footer';
import {
    BookOpen,
    Play,
    Users,
    HelpCircle,
    ArrowLeft,
    Save,
    Eye,
    Info,
    Globe
} from 'lucide-react';

import InfoTab from '../components/hazard/InfoTab';
import ContentTab from '../components/hazard/ContentTab';
import ActivityTab from '../components/hazard/ActivityTab';

interface TabItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    description: string;
}

const tabs: TabItem[] = [
    {
        id: 'info',
        label: 'Info',
        icon: <Info className="w-5 h-5" />,
        description: 'Basic lecture information and details'
    },
    {
        id: 'content',
        label: 'Content',
        icon: <BookOpen className="w-5 h-5" />,
        description: 'Create educational content and materials'
    },
    {
        id: 'simulation',
        label: 'Simulation',
        icon: <Play className="w-5 h-5" />,
        description: 'Design interactive simulations'
    },
    {
        id: 'activity',
        label: 'Activity',
        icon: <Users className="w-5 h-5" />,
        description: 'Build engaging learning activities'
    },
    {
        id: 'quiz',
        label: 'Quiz',
        icon: <HelpCircle className="w-5 h-5" />,
        description: 'Create assessments and quizzes'
    }
];

// Context for sharing lecture data between tabs
interface LectureContextType {
    // Core state
    lectureId: string | null;
    setLectureId: (id: string) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    navigateToNextTab: () => void;
    
    // Tab action registration
    saveDraft: () => Promise<void>;
    publish: () => Promise<void>;
    registerTabActions: (actions: {
        saveDraft?: () => Promise<void>;
        publish?: () => Promise<void>;
    }) => void;
    unregisterTabActions: () => void;
}

const LectureContext = createContext<LectureContextType | undefined>(undefined);

export const useLectureContext = () => {
    const context = useContext(LectureContext);
    if (!context) {
        throw new Error('useLectureContext must be used within LectureProvider');
    }
    return context;
};

// Header Component
const CreateLectureHeader: React.FC = () => {
    const navigate = useNavigate();
    const { activeTab, lectureId, saveDraft, publish } = useLectureContext();
    const [isLoading, setIsLoading] = useState(false);
    
    const handlePreview = () => {
        if (lectureId) {
            window.open(`/lecture/${lectureId}`, '_blank');
        }
    };

    const handleSaveDraft = async () => {
        if (!lectureId) return;
        setIsLoading(true);
        try {
            await saveDraft();
        } catch (error) {
            console.error('Error saving draft:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!lectureId) return;
        setIsLoading(true);
        try {
            await publish();
        } catch (error) {
            console.error('Error publishing:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left Side - Back Button and Title */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/admin')}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to Dashboard</span>
                        </button>
                        <div className="w-px h-6 bg-gray-300"></div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            {lectureId ? 'Edit Lecture' : 'Create New Lecture'}
                        </h1>
                        {lectureId && (
                            <span className="text-sm text-gray-500">ID: {lectureId}</span>
                        )}
                    </div>

                    {/* Right Side - Action Buttons */}
                    <div className="flex items-center space-x-3">
                        {activeTab === 'content' && lectureId && (
                            <>
                                <button 
                                    onClick={handlePreview}
                                    disabled={isLoading}
                                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Eye className="w-4 h-4" />
                                    <span>Preview</span>
                                </button>
                                <button 
                                    onClick={handleSaveDraft}
                                    disabled={isLoading}
                                    className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{isLoading ? 'Saving...' : 'Save Draft'}</span>
                                </button>
                                <button 
                                    onClick={handlePublish}
                                    disabled={isLoading}
                                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Globe className="w-4 h-4" />
                                    <span>{isLoading ? 'Publishing...' : 'Publish'}</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Tab Navigation Component
const TabNavigation: React.FC = () => {
    const { activeTab, setActiveTab, lectureId } = useLectureContext();
    
    return (
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => {
                        // Disable tabs that require lectureId if it doesn't exist
                        const isDisabled = !lectureId && tab.id !== 'info';
                        
                        return (
                            <button
                                key={tab.id}
                                onClick={() => !isDisabled && setActiveTab(tab.id)}
                                disabled={isDisabled}
                                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : isDisabled
                                        ? 'border-transparent text-gray-300 cursor-not-allowed'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Tab Content Component
const TabContent: React.FC = () => {
    const { activeTab, lectureId } = useLectureContext();
    
    if (activeTab === 'info') {
        return <InfoTab />;
    }
    
    if (activeTab === 'content') {
        return <ContentTab />;
    }

    if (activeTab === 'activity') {
        return <ActivityTab />;
    }

    // For other tabs, show placeholder content
    const currentTab = tabs.find(tab => tab.id === activeTab);

    const getTabIcon = (tabId: string) => {
        switch (tabId) {
            case 'info':
                return <Info className="w-8 h-8 text-gray-400" />;
            case 'content':
                return <BookOpen className="w-8 h-8 text-gray-400" />;
            case 'simulation':
                return <Play className="w-8 h-8 text-gray-400" />;
            case 'activity':
                return <Users className="w-8 h-8 text-gray-400" />;
            case 'quiz':
                return <HelpCircle className="w-8 h-8 text-gray-400" />;
            default:
                return <BookOpen className="w-8 h-8 text-gray-400" />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    {getTabIcon(activeTab)}
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                    {currentTab?.label} Content
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {currentTab?.description}
                </p>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12">
                    <p className="text-gray-500 text-lg">
                        Content for the {currentTab?.label.toLowerCase()} tab will be implemented here.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Progress Indicator Component
const ProgressIndicator: React.FC = () => {
    const { activeTab } = useLectureContext();
    
    const getCurrentStepNumber = () => {
        const stepMap = { info: 1, content: 2, simulation: 3, activity: 4, quiz: 5 };
        return stepMap[activeTab as keyof typeof stepMap] || 1;
    };

    const currentStep = getCurrentStepNumber();
    const totalSteps = tabs.length;

    return (
        <div className="bg-blue-50 border-b border-blue-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700 font-medium">
                        Step {currentStep} of {totalSteps}
                    </span>
                    <div className="flex items-center space-x-2">
                        <div className="w-32 bg-blue-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                            ></div>
                        </div>
                        <span className="text-blue-600 font-medium">
                            {Math.round((currentStep / totalSteps) * 100)}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function AdminCreateLecture() {
    const [activeTab, setActiveTab] = useState<string>('info');
    const [lectureId, setLectureId] = useState<string | null>(null);
    
    // Tab action registry
    const [tabActions, setTabActions] = useState<{
        saveDraft?: () => Promise<void>;
        publish?: () => Promise<void>;
    }>({});

    const navigateToNextTab = useCallback(() => {
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
        if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1].id);
        }
    }, [activeTab]);

    // Default implementations for when no tab actions are registered
    const defaultSaveDraft = useCallback(async () => {
        console.warn('No saveDraft action registered for current tab');
    }, []);

    const defaultPublish = useCallback(async () => {
        console.warn('No publish action registered for current tab');
    }, []);

    // Action registration methods
    const registerTabActions = useCallback((actions: {
        saveDraft?: () => Promise<void>;
        publish?: () => Promise<void>;
    }) => {
        setTabActions(actions);
    }, []);

    const unregisterTabActions = useCallback(() => {
        setTabActions({});
    }, []);

    const lectureContextValue: LectureContextType = {
        // Core state
        lectureId,
        setLectureId,
        activeTab,
        setActiveTab,
        navigateToNextTab,
        
        // Tab actions (use registered actions or defaults)
        saveDraft: tabActions.saveDraft || defaultSaveDraft,
        publish: tabActions.publish || defaultPublish,
        registerTabActions,
        unregisterTabActions
    };

    return (
        <LectureContext.Provider value={lectureContextValue}>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <CreateLectureHeader />

                {/* Progress Indicator */}
                <ProgressIndicator />

                {/* Tab Navigation */}
                <TabNavigation />

                {/* Main Content Area */}
                <main className="flex-1 py-8">
                    <TabContent />
                </main>

                <Footer />
            </div>
        </LectureContext.Provider>
    );
}