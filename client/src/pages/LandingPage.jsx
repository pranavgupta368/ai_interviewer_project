import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Brain, FileText, Mic, BarChart3, CheckCircle, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: FileText,
            title: 'Resume Analysis',
            description: 'AI extracts your skills and experience to personalize interview questions',
            color: 'blue'
        },
        {
            icon: Mic,
            title: 'Voice Interaction',
            description: 'Natural conversation with AI-powered voice responses using edge-tts',
            color: 'purple'
        },
        {
            icon: BarChart3,
            title: 'Detailed Report',
            description: 'Get comprehensive feedback with scores and improvement suggestions',
            color: 'pink'
        }
    ];

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
                    <div className="text-xs font-mono text-gray-500 border border-gray-800 rounded px-2 py-1">
                        BETA v1.0
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 py-20 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50 mb-8">
                    <Sparkles className="w-10 h-10 text-white" />
                </div>

                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-tight">
                    The AI Interviewer That<br />Actually Understands You.
                </h1>

                <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                    Upload your resume, get interviewed by AI, and receive instant feedback.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
                    <button
                        onClick={() => navigate('/start')}
                        className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                        Start Interview
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-8 py-4 bg-gray-800 border-2 border-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-700 hover:border-gray-600 transition-all flex items-center justify-center gap-2"
                    >
                        <Brain className="w-5 h-5" />
                        Recruiter Dashboard
                    </button>
                </div>

                {/* Stats/Social Proof */}
                <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-20">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-1">100%</div>
                        <div className="text-sm text-gray-500">Free & Open</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-1">AI</div>
                        <div className="text-sm text-gray-500">Powered</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-pink-400 mb-1">Instant</div>
                        <div className="text-sm text-gray-500">Feedback</div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="max-w-7xl mx-auto px-4 py-20">
                <h2 className="text-3xl font-bold text-center mb-12">
                    Everything You Need for a Complete Interview
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        const colorClasses = {
                            blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20',
                            purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20',
                            pink: 'from-pink-500/10 to-pink-600/5 border-pink-500/20'
                        };
                        const iconColors = {
                            blue: 'text-blue-400',
                            purple: 'text-purple-400',
                            pink: 'text-pink-400'
                        };

                        return (
                            <div
                                key={index}
                                className={`bg-gradient-to-br ${colorClasses[feature.color]} border rounded-2xl p-8 hover:scale-105 transition-all`}
                            >
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[feature.color]} flex items-center justify-center mb-6`}>
                                    <Icon className={`w-7 h-7 ${iconColors[feature.color]}`} />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* How It Works */}
            <section className="max-w-5xl mx-auto px-4 py-20">
                <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

                <div className="space-y-6">
                    {[
                        { step: '1', title: 'Upload Resume', desc: 'PDF resume gets analyzed by AI in seconds' },
                        { step: '2', title: 'Voice Interview', desc: 'Answer questions tailored to your experience' },
                        { step: '3', title: 'Get Report Card', desc: 'Receive detailed feedback and scores' }
                    ].map((item) => (
                        <div key={item.step} className="flex items-start gap-6 bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
                                {item.step}
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                <p className="text-gray-400">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-4xl mx-auto px-4 py-20 text-center">
                <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-12">
                    <h2 className="text-4xl font-bold mb-4">Ready to ace your next interview?</h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Start practicing with AI-powered interviews today
                    </p>
                    <button
                        onClick={() => navigate('/start')}
                        className="px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold text-xl hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all inline-flex items-center gap-3"
                    >
                        <Sparkles className="w-6 h-6" />
                        Start Your Interview Now
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-800/50 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>Built with Groq API, edge-tts, and React • Open Source • Free Forever</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
