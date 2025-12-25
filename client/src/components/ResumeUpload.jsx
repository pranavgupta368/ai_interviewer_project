import React, { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const ResumeUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
                setError(null);
            } else {
                setError('Please upload a PDF file');
            }
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === 'application/pdf') {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Please upload a PDF file');
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await axios.post('/api/resume/parse', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                console.log('Resume parsed successfully:', response.data.data);
                onUploadSuccess(response.data.data);
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.message || 'Failed to upload resume. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50">
                        <FileText className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                        AI Technical Interview
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Upload your resume to start a personalized interview
                    </p>
                </div>

                {/* Upload Area */}
                <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 space-y-6">
                    <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${dragActive
                                ? 'border-blue-500 bg-blue-500/10'
                                : file
                                    ? 'border-green-500 bg-green-500/10'
                                    : 'border-gray-600 hover:border-gray-500'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            id="resume-upload"
                            accept=".pdf"
                            onChange={handleChange}
                            className="hidden"
                        />

                        <label
                            htmlFor="resume-upload"
                            className="cursor-pointer flex flex-col items-center gap-4"
                        >
                            {file ? (
                                <>
                                    <CheckCircle className="w-16 h-16 text-green-400" />
                                    <div>
                                        <p className="text-xl font-semibold text-green-300">{file.name}</p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setFile(null);
                                        }}
                                        className="text-sm text-gray-400 hover:text-gray-300 underline"
                                    >
                                        Choose different file
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-16 h-16 text-gray-400" />
                                    <div>
                                        <p className="text-xl font-semibold text-gray-200">
                                            Drop your resume here
                                        </p>
                                        <p className="text-sm text-gray-400 mt-2">
                                            or click to browse
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        PDF format only • Max 5MB
                                    </p>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className={`
              w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all
              ${!file || isUploading
                                ? 'bg-gray-700 cursor-not-allowed opacity-50'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105'
                            }
            `}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Parsing Resume...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Start Interview
                            </>
                        )}
                    </button>

                    {/* Info */}
                    <div className="text-center pt-4 border-t border-gray-700">
                        <p className="text-sm text-gray-400">
                            Your resume will be analyzed to personalize the interview questions
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeUpload;
