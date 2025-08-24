// src/pages/AdminCreateLecture.tsx
import React, { useState, createContext, useContext, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    Globe,
    Loader2,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import { 
  getFirestore, 
  doc, 
  getDoc,
  updateDoc 
} from 'firebase/firestore';

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

// Lecture data interface
export interface LectureData {
    title: string;
    description: string;
    image: string;
    content: string;
    images: string[];
    status: 'draft' | 'published';
    createdAt?: any;
    updatedAt?: any;
}

// Context for sharing lecture data between tabs
interface LectureContextType {
    // Core state
    lectureId: string | null;
    setLectureId: (id: string) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    navigateToNextTab: () => void;
    
    // Edit mode
    isEditMode: boolean;
    isLoadingLecture: boolean;
    lectureData: LectureData | null;
    setLectureData: (data: Partial<LectureData>) => void;
    refreshLectureData: () => Promise<void>;
    
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

// Loading Component for Edit Mode
const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">{message}</p>
        </div>
    </div>
);

// Header Component
const CreateLectureHeader: React.FC = () => {
    const navigate = useNavigate();
    const { 
        activeTab, 
        lectureId, 
        isEditMode, 
        lectureData,
        saveDraft, 
        publish,
        refreshLectureData,
        isLoadingLecture 
    } = useLectureContext();
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

    const handleRefreshData = async () => {
        if (isEditMode && lectureId) {
            try {
                await refreshLectureData();
            } catch (error) {
                console.error('Error refreshing data:', error);
            }
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
                        <div className="flex items-center space-x-3">
                            <h1 className="text-xl font-semibold text-gray-900">
                                {isEditMode ? 'Edit Lecture' : 'Create New Lecture'}
                            </h1>
                            {isEditMode && lectureData && (
                                <div className="flex items-center space-x-2">
                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                        {lectureData.status}
                                    </span>
                                    <button
                                        onClick={handleRefreshData}
                                        disabled={isLoadingLecture}
                                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                        title="Refresh lecture data"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${isLoadingLecture ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            )}
                        </div>
                        {lectureId && (
                            <span className="text-sm text-gray-500">ID: {lectureId.slice(-8)}</span>
                        )}
                    </div>

                    {/* Right Side - Action Buttons */}
                    <div className="flex items-center space-x-3">
                        {lectureId && (
                            <>
                                <button 
                                    onClick={handlePreview}
                                    disabled={isLoading || isLoadingLecture}
                                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Eye className="w-4 h-4" />
                                    <span>Preview</span>
                                </button>
                                
                                {(activeTab === 'content' || isEditMode) && (
                                    <>
                                        <button 
                                            onClick={handleSaveDraft}
                                            disabled={isLoading || isLoadingLecture}
                                            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                            <span>{isLoading ? 'Saving...' : 'Save Draft'}</span>
                                        </button>
                                        <button 
                                            onClick={handlePublish}
                                            disabled={isLoading || isLoadingLecture}
                                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Globe className="w-4 h-4" />
                                            )}
                                            <span>{isLoading ? 'Publishing...' : 'Publish'}</span>
                                        </button>
                                    </>
                                )}
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
    const { activeTab, setActiveTab, lectureId, isEditMode } = useLectureContext();
    
    return (
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => {
                        // In edit mode, all tabs are enabled if we have lectureId
                        // In create mode, only enable tabs after lectureId is created
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
                                {isEditMode && lectureId && (
                                    <div className="w-2 h-2 bg-green-400 rounded-full ml-1" title="Data available" />
                                )}
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
    const { activeTab, lectureId, isLoadingLecture } = useLectureContext();
    
    // Show loading state for any tab while lecture data is being loaded
    if (isLoadingLecture) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading lecture data...</p>
                    </div>
                </div>
            </div>
        );
    }
    
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
    const { activeTab, isEditMode, lectureData } = useLectureContext();
    
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
                    <div className="flex items-center space-x-4">
                        <span className="text-blue-700 font-medium">
                            Step {currentStep} of {totalSteps}
                        </span>
                        {isEditMode && lectureData && (
                            <span className="text-blue-600 text-xs">
                                Editing: {lectureData.title || 'Untitled Lecture'}
                            </span>
                        )}
                    </div>
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
    const navigate = useNavigate();
    const { lectureId: urlLectureId } = useParams<{ lectureId?: string }>();
    
    const [activeTab, setActiveTab] = useState<string>('info');
    const [lectureId, setLectureId] = useState<string | null>(urlLectureId || null);
    const [isLoadingLecture, setIsLoadingLecture] = useState(false);
    const [lectureData, setLectureDataState] = useState<LectureData | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    
    const isEditMode = !!urlLectureId;
    const firestore = getFirestore();
    
    // Tab action registry
    const [tabActions, setTabActions] = useState<{
        saveDraft?: () => Promise<void>;
        publish?: () => Promise<void>;
    }>({});

    // Load lecture data in edit mode
    useEffect(() => {
        if (isEditMode && urlLectureId) {
            loadLectureData(urlLectureId);
        }
    }, [isEditMode, urlLectureId]);

    const loadLectureData = async (id: string) => {
        setIsLoadingLecture(true);
        setLoadError(null);
        
        try {
            const lectureRef = doc(firestore, 'lectures', id);
            const lectureSnap = await getDoc(lectureRef);
            
            if (!lectureSnap.exists()) {
                throw new Error('Lecture not found');
            }
            
            const data = lectureSnap.data();
            const loadedData: LectureData = {
                title: data.title || '',
                description: data.description || '',
                image: data.image || '',
                content: data.content || '',
                images: data.images || [],
                status: data.status || (data.isPublished ? 'published' : 'draft'),
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
            };
            
            setLectureDataState(loadedData);
            setLectureId(id);
            
            console.log('Loaded lecture data for editing:', loadedData);
            
        } catch (error) {
            console.error('Error loading lecture:', error);
            setLoadError('Failed to load lecture data. The lecture may not exist or you may not have permission to access it.');
        } finally {
            setIsLoadingLecture(false);
        }
    };

    const refreshLectureData = useCallback(async () => {
        if (!lectureId) return;
        await loadLectureData(lectureId);
    }, [lectureId, firestore]);

    const setLectureData = useCallback((updates: Partial<LectureData>) => {
        setLectureDataState(prev => {
            if (!prev) return null;
            const updated = { ...prev, ...updates };
            console.log('Updated lecture data in context:', updated);
            return updated;
        });
    }, []);

    const navigateToNextTab = useCallback(() => {
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
        if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1].id);
        }
    }, [activeTab]);

    // Enhanced save and publish methods
    const defaultSaveDraft = useCallback(async () => {
        if (!lectureId) {
            console.warn('No lecture ID available for saving draft');
            return;
        }
        
        try {
            const updateData: any = {
                status: 'draft',
                updatedAt: new Date()
            };

            // Include current lecture data if available
            if (lectureData) {
                updateData.title = lectureData.title;
                updateData.description = lectureData.description;
                updateData.image = lectureData.image;
                updateData.content = lectureData.content;
                updateData.images = lectureData.images;
            }

            await updateDoc(doc(firestore, 'lectures', lectureId), updateData);
            
            // Update local state
            setLectureData({ status: 'draft' });
            
            console.log('Draft saved successfully with current data');
        } catch (error) {
            console.error('Error saving draft:', error);
            throw error;
        }
    }, [lectureId, firestore, lectureData, setLectureData]);

    const defaultPublish = useCallback(async () => {
        if (!lectureId) {
            console.warn('No lecture ID available for publishing');
            return;
        }
        
        try {
            const updateData: any = {
                status: 'published',
                isPublished: true, // Legacy support
                updatedAt: new Date()
            };

            // Include current lecture data if available
            if (lectureData) {
                updateData.title = lectureData.title;
                updateData.description = lectureData.description;
                updateData.image = lectureData.image;
                updateData.content = lectureData.content;
                updateData.images = lectureData.images;
            }

            await updateDoc(doc(firestore, 'lectures', lectureId), updateData);
            
            // Update local state
            setLectureData({ status: 'published' });
            
            console.log('Lecture published successfully with current data');
        } catch (error) {
            console.error('Error publishing lecture:', error);
            throw error;
        }
    }, [lectureId, firestore, lectureData, setLectureData]);

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
        
        // Edit mode
        isEditMode,
        isLoadingLecture,
        lectureData,
        setLectureData,
        refreshLectureData,
        
        // Tab actions (use registered actions or defaults)
        saveDraft: tabActions.saveDraft || defaultSaveDraft,
        publish: tabActions.publish || defaultPublish,
        registerTabActions,
        unregisterTabActions
    };

    // Show error message if loading failed
    if (loadError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Lecture</h2>
                    <p className="text-gray-600 mb-6">{loadError}</p>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => navigate('/admin')}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Back to Dashboard
                        </button>
                        <button
                            onClick={() => urlLectureId && loadLectureData(urlLectureId)}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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