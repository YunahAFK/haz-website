// src/components/activity/MultipleChoiceOptions.tsx
import React from 'react';
import { CheckCircle, Circle, X } from 'lucide-react';
import { ActivityOption } from '../../types/activity';

interface MultipleChoiceOptionsProps {
    options: ActivityOption[];
    onUpdateOption: (id: string, text: string) => void;
    onSetCorrectOption: (id: string) => void;
    onRemoveOption: (id: string) => void;
    onAddOption: () => void;
    disabled?: boolean;
}

export const MultipleChoiceOptions: React.FC<MultipleChoiceOptionsProps> = ({
    options,
    onUpdateOption,
    onSetCorrectOption,
    onRemoveOption,
    onAddOption,
    disabled = false
}) => (
    <div>
        <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
                Answer Options *
            </label>
            <button
                type="button"
                onClick={onAddOption}
                disabled={disabled || options.length >= 6}
                className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Add Option
            </button>
        </div>

        <div className="space-y-3">
            {options.map((option, index) => (
                <div key={option.id} className="flex items-center space-x-3">
                    <button
                        type="button"
                        onClick={() => onSetCorrectOption(option.id)}
                        className="flex-shrink-0"
                        disabled={disabled}
                    >
                        {option.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                            <Circle className="w-5 h-5 text-gray-400 hover:text-green-600" />
                        )}
                    </button>

                    <input
                        type="text"
                        value={option.text}
                        onChange={(e) => onUpdateOption(option.id, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={disabled}
                    />

                    {options.length > 2 && (
                        <button
                            type="button"
                            onClick={() => onRemoveOption(option.id)}
                            className="flex-shrink-0 text-gray-400 hover:text-red-600"
                            disabled={disabled}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            ))}
        </div>

        <p className="text-xs text-gray-500 mt-2">
            Click the circle next to an option to mark it as the correct answer.
        </p>
    </div>
);