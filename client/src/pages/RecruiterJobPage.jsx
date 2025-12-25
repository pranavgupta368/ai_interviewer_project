import React, { useState } from 'react';
import { Briefcase, Copy, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';

const RecruiterJobPage = () => {
    const [formData, setFormData] = useState({
        roleTitle: '',
        jobDescription: '',
        difficulty: 'Medium',
        duration: 'Standard (30 min)'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [jobId, setJobId] = useState(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await axios.post('/api/jobs/create', formData);

            if (response.data.success) {
                setJobId(response.data.data.id);
                console.log('✅ Job created:', response.data.data);
            }
        } catch (err) {
            console.error('Job creation error:', err);
            setError(err.response?.data?.message || 'Failed to create job. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const magicLink = jobId ? `${window.location.origin}/interview/${jobId}` : '';

    const copyToClipboard = () => {
        navigator.clipboard.writeText(magicLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCreateAnother = () => {
        setJobId(null);
        setFormData({
            roleTitle: '',
            jobDescription: '',
            difficulty: 'Medium',
            duration: 'Standard (30 min)'
        });
        setCopied(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white">
            {/* Header */}
            <header className="border-b border-gray-800/50 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        <h1 className="font-bold text-xl tracking-tight">
                            AI<span className="text-blue-500">INTERVIEWER</span>
                        </h1>
                    </div>
                    <div className="text-sm text-gray-400">Recruiter Portal</div>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-12">
                {!jobId ? (
                    <>
                        {/* Form Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/50 mb-4">
                                <Briefcase className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                Create Interview Job
                            </h1>
                            <p className="text-gray-400 text-lg">
                                Generate a magic link for candidates to interview for this role
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 space-y-6">
                            {/* Role Title */}
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-300">
                                    Role Title <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="roleTitle"
                                    value={formData.roleTitle}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Senior React Developer"
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            {/* Job Description */}
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-300">
                                    Job Description <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    name="jobDescription"
                                    value={formData.jobDescription}
                                    onChange={handleInputChange}
                                    required
                                    rows={6}
                                    placeholder="Describe the role requirements, responsibilities, and required skills..."
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                />
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-300">
                                    Interview Difficulty <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                >
                                    <option value="Easy">Easy - Entry Level</option>
                                    <option value="Medium">Medium - Mid-Level</option>
                                    <option value="Hard">Hard - Senior Level</option>
                                </select>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-300">
                                    Interview Duration <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                >
                                    <option value="Short (15 min)">Short (15 min) - Quick screening</option>
                                    <option value="Standard (30 min)">Standard (30 min) - Balanced interview</option>
                                    <option value="Deep Dive (60 min)">Deep Dive (60 min) - Comprehensive assessment</option>
                                </select>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`
                                    w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all
                                    ${isSubmitting
                                        ? 'bg-gray-700 cursor-not-allowed opacity-50'
                                        : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105'
                                    }
                                `}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating Link...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Generate Interview Link
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        {/* Success State */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50 mb-4">
                                <CheckCircle className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                                Magic Link Created!
                            </h1>
                            <p className="text-gray-400 text-lg">
                                Share this link with candidates to start the interview
                            </p>
                        </div>

                        {/* Magic Link Box */}
                        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold mb-3 text-gray-300">
                                    Interview Magic Link
                                </label>
                                <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex items-center justify-between gap-4">
                                    <code className="text-blue-400 font-mono text-sm break-all flex-1">
                                        {magicLink}
                                    </code>
                                    <button
                                        onClick={copyToClipboard}
                                        className={`
                                            px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all flex-shrink-0
                                            ${copied
                                                ? 'bg-green-600 text-white'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                            }
                                        `}
                                    >
                                        {copied ? (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Job Details Summary */}
                            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Role Title</div>
                                    <div className="font-semibold">{formData.roleTitle}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Difficulty</div>
                                    <div className="font-semibold">{formData.difficulty}</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={handleCreateAnother}
                                    className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 rounded-xl font-semibold hover:bg-gray-700 transition-all"
                                >
                                    Create Another Job
                                </button>
                                <button
                                    onClick={() => window.open(magicLink, '_blank')}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                                >
                                    Test Interview
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RecruiterJobPage;
