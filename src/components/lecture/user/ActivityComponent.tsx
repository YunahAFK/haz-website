// src/components/lecture/user/ActivityComponent.tsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Activity, UserAnswer } from '../../../types/(LectureDetail)/activity';

interface ActivityComponentProps {
    activity: Activity;
    onAnswer: (answer: string | number) => void;
    userAnswer?: UserAnswer;
}

export const ActivityComponent: React.FC<ActivityComponentProps> = ({
    activity,
    onAnswer,
    userAnswer
}) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');
    const [showResult, setShowResult] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAnswer) return;

        onAnswer(selectedAnswer);
        setShowResult(true);
    };

    useEffect(() => {
        setSelectedAnswer('');
        setShowResult(false);
    }, [activity.id]);

    useEffect(() => {
        if (userAnswer) {
            setShowResult(true);
        }
    }, [userAnswer]);

    if (showResult) {
        return (
            <div className="text-center">
                {userAnswer?.isCorrect ? (
                    <div>
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h4 className="text-xl font-semibold text-green-800 mb-2">Correct!</h4>
                        <p className="text-gray-600">Great job! Moving to the next question...</p>
                    </div>
                ) : (
                    <div>
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h4 className="text-xl font-semibold text-red-800 mb-2">Incorrect</h4>
                        {activity.type === 'multiple-choice' ? (
                            <p className="text-gray-600">
                                The correct answer was:{' '}
                                <strong>{activity.options?.find(opt => opt.isCorrect)?.text}</strong>
                            </p>
                        ) : (
                            <p className="text-gray-600">
                                The correct answer was: <strong>{activity.correctAnswer}</strong>
                            </p>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {activity.question}
            </h3>

            <form onSubmit={handleSubmit}>
                {activity.type === 'multiple-choice' ? (
                    <div className="space-y-3 mb-6">
                        {activity.options?.map((option) => (
                            <label
                                key={option.id}
                                className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                <input
                                    type="radio"
                                    name="answer"
                                    value={option.id}
                                    checked={selectedAnswer === option.id}
                                    onChange={(e) => setSelectedAnswer(e.target.value)}
                                    className="mr-3"
                                />
                                <span>{option.text}</span>
                            </label>
                        ))}
                    </div>
                ) : (
                    <div className="mb-6">
                        <input
                            type="text"
                            value={selectedAnswer}
                            onChange={(e) => setSelectedAnswer(e.target.value)}
                            placeholder="Enter your answer..."
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!selectedAnswer}
                    className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Submit Answer
                </button>
            </form>
        </div>
    );
};