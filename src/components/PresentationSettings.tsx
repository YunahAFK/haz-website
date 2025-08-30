// src/components/PresentationSettings.tsx
import React from 'react';
import { X } from 'lucide-react';
import { PresentationSettings as Settings } from '../types/presentation';

interface PresentationSettingsProps {
    settings: Settings;
    onSettingsChange: (settings: Settings) => void;
    onClose: () => void;
}

export const PresentationSettings: React.FC<PresentationSettingsProps> = ({
    settings,
    onSettingsChange,
    onClose
}) => {
    const updateSettings = (updates: Partial<Settings>) => {
        onSettingsChange({ ...settings, ...updates });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Presentation Settings</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={settings.autoAdvance}
                                onChange={(e) => updateSettings({ autoAdvance: e.target.checked })}
                                className="mr-2"
                            />
                            Auto-advance slides
                        </label>
                    </div>

                    {settings.autoAdvance && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Slide Interval (seconds)
                            </label>
                            <input
                                type="number"
                                min="3"
                                max="30"
                                value={settings.slideInterval}
                                onChange={(e) => updateSettings({ slideInterval: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Theme
                        </label>
                        <select
                            value={settings.theme}
                            onChange={(e) => updateSettings({ theme: e.target.value as 'light' | 'dark' | 'blue' })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="blue">Blue Gradient</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};