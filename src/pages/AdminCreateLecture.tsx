// src/pages/AdminCreateLecture.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/layout/Footer';
import {
    BookOpen,
    Play,
    Users,
    HelpCircle,
    ArrowLeft,
    Save,
    Eye
} from 'lucide-react';

import LectureTab from '../components/hazard/LectureTab';

interface TabItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    description: string;
}

const tabs: TabItem[] = [
    {
        id: 'lecture',
        label: 'Lecture',
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

// Header Component
const CreateLectureHeader: React.FC = () => {
    const navigate = useNavigate();
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
                        <h1 className="text-xl font-semibold text-gray-900">Create New Lecture</h1>
                    </div>

                    {/* Right Side - Action Buttons */}
                    <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                            <Eye className="w-4 h-4" />
                            <span>Preview</span>
                        </button>
                        <button className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                            <Save className="w-4 h-4" />
                            <span>Save Draft</span>
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium">
                            Publish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Tab Navigation Component
const TabNavigation: React.FC<{
    activeTab: string;
    onTabChange: (tabId: string) => void;
}> = ({ activeTab, onTabChange }) => (
    <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
    </div>
);

// Updated Tab Content Component that renders the actual content
const TabContent: React.FC<{
    activeTab: string;
}> = ({ activeTab }) => {
    // Render the LectureTab component when lecture tab is active
    if (activeTab === 'lecture') {
        return <LectureTab />;
    }

    // For other tabs, show placeholder content (you'll replace these later)
    const currentTab = tabs.find(tab => tab.id === activeTab);

    const getTabIcon = (tabId: string) => {
        switch (tabId) {
            case 'lecture':
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
const ProgressIndicator: React.FC<{
    currentStep: number;
    totalSteps: number;
}> = ({ currentStep, totalSteps }) => (
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

export default function AdminCreateLecture() {
    const [activeTab, setActiveTab] = useState<string>('lecture');

    const getCurrentStepNumber = () => {
        const stepMap = { lecture: 1, simulation: 2, activity: 3, quiz: 4 };
        return stepMap[activeTab as keyof typeof stepMap] || 1;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <CreateLectureHeader />

            {/* Progress Indicator */}
            <ProgressIndicator
                currentStep={getCurrentStepNumber()}
                totalSteps={tabs.length}
            />

            {/* Tab Navigation */}
            <TabNavigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Main Content Area */}
            <main className="flex-1 py-8">
                <TabContent activeTab={activeTab} />
            </main>

            <Footer />
        </div>
    );
}