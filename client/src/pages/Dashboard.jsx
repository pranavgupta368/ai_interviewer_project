import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    BarChart3,
    ArrowLeft,
    Plus,
    Calendar,
    User,
    Briefcase,
    Award,
} from "lucide-react";
import axios from "axios";

const Dashboard = () => {
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // TODO: Backend endpoint needs to be created
            // For now, this will fail gracefully and show empty state
            const response = await axios.get("/api/interview/all");
            setInterviews(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch interviews:", err);
            // Set empty array on error to show "no interviews" state
            setInterviews([]);
            if (err.response?.status !== 404) {
                setError(
                    "Unable to load interviews. The endpoint may not be available yet."
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreBadgeColor = (score) => {
        if (score >= 80)
            return "bg-green-500/20 text-green-400 border-green-500/30";
        if (score >= 60)
            return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
        return "bg-red-500/20 text-red-400 border-red-500/30";
    };

    const calculateAverageScore = () => {
        if (interviews.length === 0) return 0;
        const sum = interviews.reduce(
            (acc, interview) => acc + (interview.technicalScore || 0),
            0
        );
        return Math.round(sum / interviews.length);
    };

    const activeJobs = interviews.filter(
        (i) => i.jobRole && i.jobRole !== "Practice"
    ).length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white">
            {/* Header */}
            <header className="border-b border-gray-800/50 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Home
                        </button>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-purple-400" />
                            <h1 className="font-bold text-xl tracking-tight">
                                Recruiter Dashboard
                            </h1>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/recruiter")}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Job
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">
                                Total Interviews
                            </span>
                            <User className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold">
                            {interviews.length}
                        </div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">
                                Active Jobs
                            </span>
                            <Briefcase className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold">{activeJobs}</div>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">
                                Avg Score
                            </span>
                            <Award className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="text-3xl font-bold">
                            {calculateAverageScore()}
                        </div>
                    </div>
                </div>

                {/* Interviews Table */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-700">
                        <h2 className="text-xl font-bold">Interview Results</h2>
                    </div>

                    {isLoading ? (
                        <div className="p-12 text-center text-gray-400">
                            Loading interviews...
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <p className="text-yellow-400 mb-2">{error}</p>
                            <p className="text-gray-500 text-sm">
                                Backend endpoint /api/interview/all not yet
                                implemented
                            </p>
                        </div>
                    ) : interviews.length === 0 ? (
                        <div className="p-12 text-center">
                            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 mb-4">
                                No interviews found yet. Create a Job to get
                                started!
                            </p>
                            <button
                                onClick={() => navigate("/recruiter")}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-all"
                            >
                                Create Your First Job
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                                            Candidate
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                                            Job Role
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                                            Difficulty
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                                            Duration
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                                            Technical Score
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {interviews.map((interview) => (
                                        <tr
                                            key={interview._id || interview.id}
                                            className="hover:bg-gray-800/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
                                                        {(
                                                            interview.candidateName ||
                                                            "U"
                                                        )
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <span className="font-medium">
                                                        {interview.candidateName ||
                                                            "Unknown"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`${
                                                        !interview.jobRole ||
                                                        interview.jobRole ===
                                                            "Practice"
                                                            ? "text-gray-400 italic"
                                                            : "text-white"
                                                    }`}
                                                >
                                                    {interview.jobRole ||
                                                        "Practice"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                                        interview.difficulty ===
                                                        "Hard"
                                                            ? "bg-red-500/20 text-red-300"
                                                            : interview.difficulty ===
                                                              "Medium"
                                                            ? "bg-yellow-500/20 text-yellow-300"
                                                            : "bg-green-500/20 text-green-300"
                                                    }`}
                                                >
                                                    {interview.difficulty ||
                                                        "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300 text-sm">
                                                {interview.duration || "N/A"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-lg text-sm font-bold border ${getScoreBadgeColor(
                                                        interview.technicalScore ||
                                                            0
                                                    )}`}
                                                >
                                                    {interview.technicalScore ||
                                                        0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    {interview.createdAt
                                                        ? new Date(
                                                              interview.createdAt
                                                          ).toLocaleDateString()
                                                        : "N/A"}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
