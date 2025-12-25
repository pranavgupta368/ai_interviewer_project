import React from 'react';
import { TrendingUp, MessageSquare, Target, Award, Lightbulb } from 'lucide-react';

const CircularProgress = ({ score, label, color }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative w-40 h-40">
                <svg className="transform -rotate-90 w-40 h-40">
                    {/* Background circle */}
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-700"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className={`${color} transition-all duration-1000 ease-out`}
                        strokeLinecap="round"
                    />
                </svg>
                {/* Score display */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-3xl font-bold">{score}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">out of 100</div>
                    </div>
                </div>
            </div>
            <div className="text-center">
                <p className="font-semibold text-gray-200">{label}</p>
            </div>
        </div>
    );
};

const FeedbackCard = ({ item, index }) => {
    return (
        <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                    <span className="text-blue-400 font-bold">{index + 1}</span>
                </div>
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        <h4 className="font-semibold text-purple-300">{item.topic}</h4>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Feedback</p>
                                <p className="text-gray-300 text-sm leading-relaxed">{item.feedback}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2 mt-3 pt-3 border-t border-gray-700/50">
                            <Lightbulb className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Suggested Improvement</p>
                                <p className="text-green-100/90 text-sm leading-relaxed bg-green-500/5 p-2 rounded border border-green-500/10">
                                    {item.better_answer}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReportCard = ({ analysis, onClose }) => {
    const { technical_score, communication_score, confidence_score, feedback } = analysis;

    const averageScore = Math.round((technical_score + communication_score + confidence_score) / 3);

    const getOverallRating = (score) => {
        if (score >= 90) return { text: 'Outstanding', color: 'text-green-400', emoji: '🌟' };
        if (score >= 75) return { text: 'Great', color: 'text-blue-400', emoji: '🎯' };
        if (score >= 60) return { text: 'Good', color: 'text-yellow-400', emoji: '👍' };
        if (score >= 40) return { text: 'Fair', color: 'text-orange-400', emoji: '📈' };
        return { text: 'Needs Improvement', color: 'text-red-400', emoji: '💪' };
    };

    const rating = getOverallRating(averageScore);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white py-8 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50">
                        <Award className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                        Interview Report Card
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Your performance analysis and growth opportunities
                    </p>
                </div>

                {/* Overall Score */}
                <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 text-center">
                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Overall Performance</p>
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                            {averageScore}%
                        </span>
                        <span className="text-4xl">{rating.emoji}</span>
                    </div>
                    <p className={`text-xl font-semibold mt-2 ${rating.color}`}>{rating.text}</p>
                </div>

                {/* Score Breakdown */}
                <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700/50">
                    <h2 className="text-2xl font-bold mb-8 text-center flex items-center justify-center gap-2">
                        <TrendingUp className="w-6 h-6 text-blue-400" />
                        Performance Breakdown
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <CircularProgress
                            score={technical_score}
                            label="Technical Skills"
                            color="text-blue-500"
                        />
                        <CircularProgress
                            score={communication_score}
                            label="Communication"
                            color="text-purple-500"
                        />
                        <CircularProgress
                            score={confidence_score}
                            label="Confidence"
                            color="text-pink-500"
                        />
                    </div>
                </div>

                {/* Improvement Areas */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Lightbulb className="w-6 h-6 text-yellow-400" />
                        Key Improvement Areas
                    </h2>
                    <div className="space-y-4">
                        {feedback && feedback.map((item, index) => (
                            <FeedbackCard key={index} item={item} index={index} />
                        ))}
                    </div>
                </div>

                {/* Action Button */}
                {onClose && (
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105"
                        >
                            Start New Interview
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportCard;
