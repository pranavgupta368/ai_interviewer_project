import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import InterviewRoom from "../components/InterviewRoom";
import ResumeUpload from "../components/ResumeUpload";
import { Loader2, AlertCircle, Briefcase } from "lucide-react";

const CandidateFlow = () => {
    const { jobId } = useParams();
    const [resumeData, setResumeData] = useState(null);
    const [jobData, setJobData] = useState(null);
    const [isLoadingJob, setIsLoadingJob] = useState(false);
    const [jobError, setJobError] = useState(null);

    // Fetch job details if jobId is present in URL
    useEffect(() => {
        if (jobId) {
            fetchJobDetails();
        }
    }, [jobId]);

    const fetchJobDetails = async () => {
        setIsLoadingJob(true);
        setJobError(null);

        try {
            const response = await axios.get(`/api/jobs/${jobId}`);

            if (response.data.success) {
                setJobData(response.data.data);
                console.log("💼 Job loaded:", response.data.data);
            }
        } catch (err) {
            console.error("Failed to load job:", err);
            setJobError(
                err.response?.data?.message || "Failed to load job details"
            );
        } finally {
            setIsLoadingJob(false);
        }
    };

    const handleUploadSuccess = (data) => {
        console.log("Resume uploaded successfully:", data);
        setResumeData(data);
    };

    // Loading job details
    if (jobId && isLoadingJob) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto" />
                    <h2 className="text-2xl font-semibold">
                        Loading Job Details...
                    </h2>
                    <p className="text-gray-400">Please wait</p>
                </div>
            </div>
        );
    }

    // Job loading error
    if (jobId && jobError) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-gray-800/50 rounded-2xl p-8 border border-gray-700 text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-2">
                            Job Not Found
                        </h2>
                        <p className="text-gray-400">{jobError}</p>
                    </div>
                    <button
                        onClick={() => (window.location.href = "/")}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        Return to Homepage
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white selection:bg-blue-500/30">
            {!resumeData ? (
                // Show resume upload with job info banner if job exists
                <div>
                    {jobData && (
                        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-purple-500/30 py-4">
                            <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-purple-400" />
                                <div>
                                    <span className="font-semibold text-purple-300">
                                        Interview for:{" "}
                                    </span>
                                    <span className="text-white">
                                        {jobData.roleTitle}
                                    </span>
                                    <span className="ml-4 text-sm text-gray-400">
                                        Difficulty: {jobData.difficulty}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                    <ResumeUpload onUploadSuccess={handleUploadSuccess} />
                </div>
            ) : (
                <>
                    <header className="border-b border-gray-800/50 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
                        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                <h1 className="font-bold text-xl tracking-tight">
                                    AI
                                    <span className="text-blue-500">
                                        INTERVIEWER
                                    </span>
                                </h1>
                            </div>
                            <div className="flex items-center gap-4">
                                {jobData && (
                                    <div className="text-sm text-purple-300 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4" />
                                        {jobData.roleTitle}
                                    </div>
                                )}
                                <div className="text-sm text-gray-400">
                                    Candidate:{" "}
                                    <span className="text-blue-400 font-semibold">
                                        {resumeData.fullName}
                                    </span>
                                </div>
                                <div className="text-xs font-mono text-gray-500 border border-gray-800 rounded px-2 py-1">
                                    BETA v1.0
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="container mx-auto py-8">
                        <InterviewRoom
                            resumeData={resumeData}
                            jobRole={jobData?.roleTitle}
                            jobDescription={jobData?.jobDescription}
                            difficulty={jobData?.difficulty}
                            duration={jobData?.duration}
                        />
                    </main>
                </>
            )}
        </div>
    );
};

export default CandidateFlow;
