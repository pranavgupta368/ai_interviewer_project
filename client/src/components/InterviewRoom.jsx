import React, { useState, useRef, useEffect } from "react";
import {
    Mic,
    Square,
    Loader2,
    Volume2,
    Send,
    FileCheck,
    Clock,
    AlertCircle,
} from "lucide-react";
import axios from "axios";
import ReportCard from "./ReportCard";

const InterviewRoom = ({
    resumeData,
    jobRole,
    jobDescription,
    difficulty,
    duration,
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState(null);
    const [showReportCard, setShowReportCard] = useState(false);
    const [reportAnalysis, setReportAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Timer state
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [showWarning, setShowWarning] = useState(false);
    const timerRef = useRef(null);

    // Build personalized greeting based on resume and job data
    const buildGreeting = () => {
        let greeting = `Hello ${
            resumeData?.fullName || "there"
        }! I'm your AI Interviewer. `;

        if (jobRole) {
            greeting += `Today, we'll be interviewing you for the role of ${jobRole}. `;
            greeting += `This is a ${difficulty} difficulty interview. `;
        } else if (resumeData) {
            greeting += `I've reviewed your resume and I'm excited to discuss your skills in ${resumeData.technicalSkills
                ?.slice(0, 3)
                .join(", ")}${
                resumeData.technicalSkills?.length > 3 ? ", and more" : ""
            }. `;
        }

        greeting += "Let's begin!";
        return greeting;
    };

    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: buildGreeting(),
            timestamp: new Date().toISOString(),
        },
    ]);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const messagesEndRef = useRef(null);

    // Parse duration and start timer
    useEffect(() => {
        if (duration) {
            // Extract minutes from duration string (e.g., "Short (15 min)" -> 15)
            const match = duration.match(/(\d+)/);
            if (match) {
                const minutes = parseInt(match[1]);
                setTimeRemaining(minutes * 60); // Convert to seconds
                console.log(`⏱️ Timer set to ${minutes} minutes`);
            }
        }
    }, [duration]);

    // Countdown timer
    useEffect(() => {
        if (timeRemaining === null || timeRemaining < 0 || showReportCard) {
            return;
        }

        // Show warning at 1 minute
        if (timeRemaining === 60 && !showWarning) {
            setShowWarning(true);
            setError("⏰ 1 minute left! Wrap up your answer.");
            setTimeout(() => setError(null), 5000);
        }

        // Auto-end at 0
        if (timeRemaining === 0) {
            console.log("⏰ Timer expired - auto-ending interview");
            handleEndInterview();
            return;
        }

        timerRef.current = setTimeout(() => {
            setTimeRemaining((prev) => prev - 1);
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [timeRemaining, showReportCard]);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        if (seconds === null) return null;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: "audio/webm",
                });
                await processAudio(audioBlob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setError(null);
        } catch (err) {
            setError(
                "Could not access microphone. Please ensure you have granted permission."
            );
            console.error("Microphone error:", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Stop all tracks to release microphone
            mediaRecorderRef.current.stream
                .getTracks()
                .forEach((track) => track.stop());
        }
    };

    const processAudio = async (audioBlob) => {
        setIsProcessing(true);

        // Create form data
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        // Build history for context
        const history = messages.map((msg) => ({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.content,
        }));
        formData.append("history", JSON.stringify(history));

        // Add resume context if available
        if (resumeData) {
            formData.append("context", JSON.stringify(resumeData));
        }

        // Add job context if available
        if (jobRole) {
            formData.append(
                "jobContext",
                JSON.stringify({
                    roleTitle: jobRole,
                    jobDescription: jobDescription,
                    difficulty: difficulty,
                    duration: duration,
                })
            );
        }

        try {
            const response = await axios.post(
                "/api/interview/process",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const { userTranscript, aiTranscript, audioUrl } = response.data;

            // Update messages
            setMessages((prev) => [
                ...prev,
                {
                    role: "user",
                    content: userTranscript,
                    timestamp: new Date().toISOString(),
                },
                {
                    role: "assistant",
                    content: aiTranscript,
                    timestamp: new Date().toISOString(),
                },
            ]);

            // Play audio
            if (audioUrl) {
                setIsPlaying(true);
                const audio = new Audio(audioUrl);
                audio.onended = () => setIsPlaying(false);
                await audio.play();
            }
        } catch (err) {
            console.error("Processing error:", err);
            setError("Failed to process interview response. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEndInterview = async () => {
        // Filter out the initial greeting to avoid analyzing it
        const conversationHistory = messages.slice(1).map((msg) => ({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.content,
        }));

        if (conversationHistory.length < 2) {
            setError(
                "Please have at least one exchange before ending the interview."
            );
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            const payload = {
                history: conversationHistory,
                candidateName: resumeData?.fullName || "Anonymous",
                jobRole: jobRole || "Practice Interview",
                difficulty: difficulty || "N/A",
                duration: duration || "N/A",
            };

            // Add job context for AI analysis if available
            if (jobRole) {
                payload.jobContext = {
                    roleTitle: jobRole,
                    jobDescription: jobDescription,
                    difficulty: difficulty,
                };
            }

            console.log("📤 Sending interview data:", payload);

            const response = await axios.post(
                "/api/interview/analyze",
                payload
            );

            if (response.data.success) {
                setReportAnalysis(response.data.analysis);
                setShowReportCard(true);
            }
        } catch (err) {
            console.error("Analysis error:", err);
            setError("Failed to analyze interview. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleNewInterview = () => {
        setShowReportCard(false);
        setReportAnalysis(null);
        setMessages([
            {
                role: "assistant",
                content:
                    "Hello! I'm your AI Interviewer. I'm ready to begin when you are. Click the microphone to start speaking.",
                timestamp: new Date().toISOString(),
            },
        ]);
    };

    if (showReportCard && reportAnalysis) {
        return (
            <ReportCard
                analysis={reportAnalysis}
                onClose={handleNewInterview}
            />
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto p-4 gap-6">
            {/* Header */}
            <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                            AI Technical Interview
                        </h2>
                        <p className="text-gray-400">
                            Professional assessment session. Speak clearly and
                            concisely.
                        </p>
                    </div>

                    {/* --- INSERT THIS TIMER CODE --- */}
                    {timeRemaining !== null && (
                        <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold border ${
                                timeRemaining < 120
                                    ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            }`}
                        >
                            <Clock className="w-5 h-5" />
                            {formatTime(timeRemaining)}
                        </div>
                    )}
                    {/* ----------------------------- */}

                    <button
                        onClick={handleEndInterview}
                        disabled={
                            isAnalyzing || isProcessing || messages.length <= 1
                        }
                        className={`
                            px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all
                            ${
                                isAnalyzing
                                    ? "bg-gray-700 cursor-not-allowed opacity-50"
                                    : "bg-gradient-to-r from-green-500 to-blue-600 hover:shadow-lg hover:shadow-green-500/50 hover:scale-105"
                            }
                            ${
                                messages.length <= 1
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }
                        `}
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <FileCheck className="w-4 h-4" />
                                End Interview
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-gray-800/30 rounded-2xl p-6 overflow-y-auto border border-gray-700/50 space-y-4 shadow-inner">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${
                            msg.role === "user"
                                ? "justify-end"
                                : "justify-start"
                        }`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                                msg.role === "user"
                                    ? "bg-blue-600/20 text-blue-100 border border-blue-500/30 rounded-tr-sm"
                                    : "bg-gray-700/40 text-gray-100 border border-gray-600/30 rounded-tl-sm"
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1 opacity-50 text-xs uppercase tracking-wider font-semibold">
                                {msg.role === "user" ? "You" : "Interviewer"}
                                <span className="text-[10px] font-normal lowercase opacity-75">
                                    {new Date(msg.timestamp).toLocaleTimeString(
                                        [],
                                        { hour: "2-digit", minute: "2-digit" }
                                    )}
                                </span>
                            </div>
                            <p className="leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                ))}

                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-gray-700/40 rounded-2xl px-6 py-4 rounded-tl-sm border border-gray-600/30 flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                            <span className="text-gray-400 text-sm animate-pulse">
                                Analyzing response...
                            </span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Controls Area */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                {error && (
                    <div className="absolute top-4 bg-red-500/10 text-red-400 px-4 py-2 rounded-lg text-sm border border-red-500/20">
                        {error}
                    </div>
                )}

                <div className="flex items-center gap-6">
                    <div
                        className={`transition-all duration-300 ${
                            isPlaying
                                ? "opacity-100 scale-110"
                                : "opacity-40 scale-100"
                        }`}
                    >
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                            <Volume2
                                className={`w-6 h-6 text-purple-400 ${
                                    isPlaying ? "animate-pulse" : ""
                                }`}
                            />
                        </div>
                    </div>
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isProcessing}
                        className={`
              relative group w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
              ${
                  isProcessing
                      ? "bg-gray-700 cursor-not-allowed opacity-50"
                      : isRecording
                      ? "bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500"
                      : "bg-blue-500/10 hover:bg-blue-500/20 border-2 border-blue-500 hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)]"
              }
            `}
                    >
                        {/* Ripple effect when recording */}
                        {isRecording && (
                            <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></span>
                        )}

                        {isRecording ? (
                            <Square className="w-8 h-8 text-red-500 fill-current" />
                        ) : (
                            <Mic
                                className={`w-10 h-10 ${
                                    isProcessing
                                        ? "text-gray-400"
                                        : "text-blue-500"
                                }`}
                            />
                        )}
                    </button>
                    <div className="w-12 h-12 opacity-0" />{" "}
                    {/* Spacer for symmetry */}
                </div>

                <p className="text-sm font-medium text-gray-400">
                    {isRecording ? (
                        <span className="text-red-400 animate-pulse flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                            Recording... Tap to sent
                        </span>
                    ) : isProcessing ? (
                        <span className="text-purple-400">
                            Processing audio...
                        </span>
                    ) : (
                        "Tap microphone to answer"
                    )}
                </p>
            </div>
        </div>
    );
};

export default InterviewRoom;
