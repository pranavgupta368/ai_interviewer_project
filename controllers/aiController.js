const Groq = require("groq-sdk");
const fs = require("fs");

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// System prompt for the AI interviewer
const SYSTEM_PROMPT =
    "You are a professional, polite technical interviewer. Your goal is to assess the candidate. Keep your answers concise (max 2 sentences) to keep the voice conversation natural. Do not be repetitive.";

/**
 * Transcribe audio file using Groq Whisper API
 */
const transcribeAudio = async (audioFilePath) => {
    try {
        const audioFile = fs.createReadStream(audioFilePath);
        const transcription = await groq.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-large-v3-turbo",
            response_format: "json",
            language: "en",
            temperature: 0.0,
        });
        return transcription.text;
    } catch (error) {
        console.error("Transcription error:", error);
        throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
};

/**
 * Get AI chat response using Groq Llama API
 * Now supports resume context AND job context for targeted interviews
 */
const getChatResponse = async (
    userMessage,
    conversationHistory = [],
    context = null,
    jobContext = null
) => {
    try {
        // Build dynamic system prompt
        let systemPrompt = SYSTEM_PROMPT;

        // Add job context if provided (takes priority)
        if (jobContext) {
            const jobPrefix = `You are interviewing for the role: ${jobContext.roleTitle}. 
Job Requirements: ${jobContext.jobDescription}
Difficulty Level: ${jobContext.difficulty}
Adjust your questions and expectations based on this ${jobContext.difficulty} difficulty level. `;
            systemPrompt = jobPrefix + SYSTEM_PROMPT;
            console.log("💼 Using job-specific context for interview");
        }

        // Add resume context if provided
        if (context) {
            const contextPrefix = `The candidate is ${
                context.fullName
            }. Skills: ${
                context.technicalSkills?.join(", ") || "Not specified"
            }. Focus questions on: ${
                context.mostImpressiveProject || "their experience"
            }. `;
            systemPrompt = contextPrefix + systemPrompt;
            console.log("📋 Using resume-aware context for interview");
        }

        const messages = [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
            { role: "user", content: userMessage },
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 150,
            top_p: 1,
            stream: false,
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || "";
        if (!aiResponse) throw new Error("Empty response from AI");
        return aiResponse;
    } catch (error) {
        console.error("Chat completion error:", error);
        throw new Error(`Failed to get AI response: ${error.message}`);
    }
};

/**
 * Analyze interview transcript using Groq (Llama 3)
 * IMPROVED: Includes Markdown Stripping to prevent JSON errors
 * Now accepts job context for role-specific analysis
 */
const analyzeInterview = async (conversationHistory, jobContext = null) => {
    try {
        const transcript = conversationHistory
            .map(
                (msg) =>
                    `${msg.role === "user" ? "Candidate" : "Interviewer"}: ${
                        msg.content
                    }`
            )
            .join("\n\n");

        // Build analysis prompt with job context if available
        let analysisSystemPrompt = `You are an expert Technical Interviewer. `;

        if (jobContext) {
            analysisSystemPrompt += `You are analyzing an interview for: ${jobContext.roleTitle}
Role Requirements: ${jobContext.jobDescription}
Difficulty Level: ${jobContext.difficulty}
Adjust your scoring based on the ${jobContext.difficulty} difficulty level. `;
        }

        analysisSystemPrompt += `
        Analyze the following interview transcript. 
        Return a STRICT JSON object (no markdown, no plain text) with these fields:
        - "technical_score": (integer 0-100)
        - "communication_score": (integer 0-100)
        - "confidence_score": (integer 0-100)
        - "feedback": (array of 3 objects, each having: "topic", "feedback", "better_answer")
        
        CRITICAL: Return ONLY valid JSON.`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: analysisSystemPrompt },
                {
                    role: "user",
                    content: `Here is the transcript:\n\n${transcript}`,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            response_format: { type: "json_object" },
        });

        // --- THE FIX IS HERE ---
        let rawContent = completion.choices[0]?.message?.content || "{}";

        // 1. Strip Markdown Code Blocks (```json ... ```)
        // This is what was breaking it before!
        let cleanJson = rawContent
            .replace(/```json/g, "") // Remove start tag
            .replace(/```/g, "") // Remove end tag
            .trim(); // Remove whitespace

        let analysis;
        try {
            analysis = JSON.parse(cleanJson);
        } catch (parseError) {
            console.error("JSON Parse Failed on:", cleanJson);
            // Emergency fallback structure if AI outputs total garbage
            analysis = {
                technical_score: 0,
                communication_score: 0,
                confidence_score: 0,
                feedback: [],
            };
        }

        // 2. Validate & Fill Defaults (Safeguard)
        // If AI gives real scores, we use them. If missing, we default to 70 (passing).
        if (typeof analysis.technical_score !== "number")
            analysis.technical_score = 70;
        if (typeof analysis.communication_score !== "number")
            analysis.communication_score = 70;
        if (typeof analysis.confidence_score !== "number")
            analysis.confidence_score = 70;

        // Ensure feedback is valid
        if (
            !Array.isArray(analysis.feedback) ||
            analysis.feedback.length === 0
        ) {
            analysis.feedback = [
                {
                    topic: "General",
                    feedback: "Interview completed.",
                    better_answer: "N/A",
                },
                {
                    topic: "Communication",
                    feedback: "Clear speech.",
                    better_answer: "N/A",
                },
                {
                    topic: "Technical",
                    feedback: "Good effort.",
                    better_answer: "N/A",
                },
            ];
        }

        return analysis;
    } catch (error) {
        console.error("Interview analysis error:", error);
        throw new Error(`Failed to analyze interview: ${error.message}`);
    }
};

// /**
//  * Analyze interview transcript using Groq (Llama 3)
//  * REPLACED GEMINI WITH GROQ TO FIX 404 ERRORS
//  */
// const analyzeInterview = async (conversationHistory) => {
//     try {
//         // Build the transcript
//         const transcript = conversationHistory
//             .map(
//                 (msg) =>
//                     `${msg.role === "user" ? "Candidate" : "Interviewer"}: ${msg.content
//                     }`
//             )
//             .join("\n\n");

//         // Strict JSON System Prompt
//         const analysisSystemPrompt = `You are an expert Technical Interviewer.
//         Analyze the following interview transcript.
//         Return a STRICT JSON object (no markdown, no plain text) with these fields:
//         - technical_score (integer 0-100)
//         - communication_score (integer 0-100)
//         - confidence_score (integer 0-100)
//         - feedback (array of 3 objects, each having: "topic", "feedback", "better_answer")

//         Do not add any text before or after the JSON.`;

//         // Call Groq API
//         const completion = await groq.chat.completions.create({
//             messages: [
//                 { role: "system", content: analysisSystemPrompt },
//                 {
//                     role: "user",
//                     content: `Here is the transcript:\n\n${transcript}`,
//                 },
//             ],
//             model: "llama-3.3-70b-versatile",
//             temperature: 0.2, // Low temp for consistent JSON
//             response_format: { type: "json_object" }, // Force JSON mode
//         });

//         const jsonText = completion.choices[0]?.message?.content || "{}";
//         const analysis = JSON.parse(jsonText);

//         // Validate structure
//         if (!analysis.technical_score || !analysis.feedback) {
//             throw new Error("Invalid analysis structure");
//         }

//         return analysis;
//     } catch (error) {
//         console.error("Interview analysis error:", error);
//         throw new Error(`Failed to analyze interview: ${error.message}`);
//     }
// };

// --- MIDDLEWARE FUNCTIONS ---

const transcribeAudioMiddleware = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No audio file provided",
                message: "Please upload an audio file",
            });
        }
        const transcription = await transcribeAudio(req.file.path);
        res.json({ success: true, transcription: transcription });
    } catch (error) {
        console.error("Transcription middleware error:", error);
        res.status(500).json({
            success: false,
            error: "Transcription failed",
            message: error.message,
        });
    }
};

const getChatResponseMiddleware = async (req, res) => {
    try {
        const { message, history, context, jobContext } = req.body;
        if (!message) {
            return res.status(400).json({
                error: "No message provided",
                message: "Please provide a message",
            });
        }
        const response = await getChatResponse(
            message,
            history || [],
            context || null,
            jobContext || null
        );
        res.json({ success: true, response: response });
    } catch (error) {
        console.error("Chat middleware error:", error);
        res.status(500).json({
            success: false,
            error: "Chat completion failed",
            message: error.message,
        });
    }
};

const analyzeInterviewMiddleware = async (req, res) => {
    try {
        const {
            history,
            jobContext,
            candidateName,
            jobRole,
            difficulty,
            duration,
        } = req.body;

        if (!history || !Array.isArray(history) || history.length === 0) {
            return res.status(400).json({
                error: "No conversation history",
                message: "Please provide history",
            });
        }

        console.log(
            "📊 Analyzing interview for:",
            candidateName,
            "| Role:",
            jobRole
        );

        // Analyze the interview
        const analysis = await analyzeInterview(history, jobContext || null);

        // Save to database
        try {
            const Interview = require("../models/Interview");
            const savedInterview = await Interview.create({
                candidateName: candidateName || "Anonymous",
                jobRole: jobRole || "Practice Interview",
                difficulty: difficulty || "N/A",
                duration: duration || "N/A",
                technicalScore: analysis.technical_score || 70,
                communicationScore: analysis.communication_score || 70,
                confidenceScore: analysis.confidence_score || 70,
                feedback: analysis.feedback || [],
                createdAt: new Date(),
            });
            console.log("✅ Interview saved to database:", savedInterview._id);
        } catch (dbError) {
            console.error("⚠️ Database save failed:", dbError.message);
            // Continue anyway - analysis is more important than storage
        }

        res.json({ success: true, analysis: analysis });
    } catch (error) {
        console.error("Analysis middleware error:", error);
        res.status(500).json({
            success: false,
            error: "Analysis failed",
            message: error.message,
        });
    }
};

module.exports = {
    transcribeAudio,
    getChatResponse,
    transcribeAudioMiddleware,
    getChatResponseMiddleware,
    analyzeInterview,
    analyzeInterviewMiddleware,
};

//------------------------------------------------------------------------------------------------------------------------------------
// const Groq = require("groq-sdk");
// const fs = require("fs");

// // Initialize Groq client
// const groq = new Groq({
//     apiKey: process.env.GROQ_API_KEY,
// });

// // System prompt for the AI interviewer
// const SYSTEM_PROMPT =
//     "You are a professional, polite technical interviewer. Your goal is to assess the candidate. Keep your answers concise (max 2 sentences) to keep the voice conversation natural. Do not be repetitive.";

// /**
//  * Transcribe audio file using Groq Whisper API
//  *
//  * @param {string} audioFilePath - Path to the audio file to transcribe
//  * @returns {Promise<string>} - Transcribed text
//  */
// const transcribeAudio = async (audioFilePath) => {
//     try {
//         // Read the audio file
//         const audioFile = fs.createReadStream(audioFilePath);

//         // Call Groq Whisper API
//         const transcription = await groq.audio.transcriptions.create({
//             file: audioFile,
//             model: "whisper-large-v3-turbo",
//             response_format: "json",
//             language: "en",
//             temperature: 0.0,
//         });

//         return transcription.text;
//     } catch (error) {
//         console.error("Transcription error:", error);
//         throw new Error(`Failed to transcribe audio: ${error.message}`);
//     }
// };

// /**
//  * Get AI chat response using Groq Llama API
//  *
//  * @param {string} userMessage - The user's transcribed message
//  * @param {Array} conversationHistory - Array of previous messages [{role: 'user'|'assistant', content: '...'}]
//  * @returns {Promise<string>} - AI response text
//  */
// const getChatResponse = async (userMessage, conversationHistory = []) => {
//     try {
//         // Build messages array with system prompt
//         const messages = [
//             {
//                 role: "system",
//                 content: SYSTEM_PROMPT,
//             },
//             ...conversationHistory,
//             {
//                 role: "user",
//                 content: userMessage,
//             },
//         ];

//         // Call Groq Llama API
//         const chatCompletion = await groq.chat.completions.create({
//             messages: messages,
//             model: "llama-3.3-70b-versatile",
//             temperature: 0.7,
//             max_tokens: 150, // Keep responses concise
//             top_p: 1,
//             stream: false,
//         });

//         const aiResponse = chatCompletion.choices[0]?.message?.content || "";

//         if (!aiResponse) {
//             throw new Error("Empty response from AI");
//         }

//         return aiResponse;
//     } catch (error) {
//         console.error("Chat completion error:", error);
//         throw new Error(`Failed to get AI response: ${error.message}`);
//     }
// };

// /**
//  * Express middleware for transcription
//  */
// const transcribeAudioMiddleware = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({
//                 error: "No audio file provided",
//                 message: "Please upload an audio file",
//             });
//         }

//         const transcription = await transcribeAudio(req.file.path);

//         res.json({
//             success: true,
//             transcription: transcription,
//         });
//     } catch (error) {
//         console.error("Transcription middleware error:", error);
//         res.status(500).json({
//             success: false,
//             error: "Transcription failed",
//             message: error.message,
//         });
//     }
// };

// /**
//  * Express middleware for chat completion
//  */
// const getChatResponseMiddleware = async (req, res) => {
//     try {
//         const { message, history } = req.body;

//         if (!message) {
//             return res.status(400).json({
//                 error: "No message provided",
//                 message: "Please provide a message in the request body",
//             });
//         }

//         const response = await getChatResponse(message, history || []);

//         res.json({
//             success: true,
//             response: response,
//         });
//     } catch (error) {
//         console.error("Chat middleware error:", error);
//         res.status(500).json({
//             success: false,
//             error: "Chat completion failed",
//             message: error.message,
//         });
//     }
// };

// /**
//  * Analyze interview transcript using Gemini AI
//  *
//  * @param {Array} conversationHistory - Array of conversation messages [{role, content}]
//  * @returns {Promise<Object>} - Analysis with scores and feedback
//  */
// const analyzeInterview = async (conversationHistory) => {
//     try {
//         const { GoogleGenerativeAI } = require("@google/generative-ai");

//         // Initialize Gemini
//         const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//         const model = genAI.getGenerativeModel({
//             model: "gemini-1.5-flash-latest",
//         });

//         // Build the transcript
//         const transcript = conversationHistory
//             .map(
//                 (msg) =>
//                     `${msg.role === "user" ? "Candidate" : "Interviewer"}: ${
//                         msg.content
//                     }`
//             )
//             .join("\n\n");

//         // Analysis prompt
//         const prompt = `Analyze this interview transcript. Return a strict JSON object with: technical_score (0-100), communication_score (0-100), confidence_score (0-100), and feedback (an array of 3 objects, each with: { topic, feedback, better_answer }). Do not include markdown formatting, just raw JSON.

// Transcript:
// ${transcript}`;

//         // Generate analysis
//         const result = await model.generateContent(prompt);
//         const response = await result.response;
//         const text = response.text();

//         // Parse JSON from response
//         // Remove markdown code blocks if present
//         let jsonText = text.trim();
//         if (jsonText.startsWith("```")) {
//             jsonText = jsonText
//                 .replace(/```json?\n?/g, "")
//                 .replace(/```\n?/g, "")
//                 .trim();
//         }

//         const analysis = JSON.parse(jsonText);

//         // Validate structure
//         if (
//             !analysis.technical_score ||
//             !analysis.communication_score ||
//             !analysis.confidence_score ||
//             !analysis.feedback
//         ) {
//             throw new Error("Invalid analysis structure");
//         }

//         return analysis;
//     } catch (error) {
//         console.error("Interview analysis error:", error);
//         throw new Error(`Failed to analyze interview: ${error.message}`);
//     }
// };

// /**
//  * Express middleware for interview analysis
//  */
// const analyzeInterviewMiddleware = async (req, res) => {
//     try {
//         const { history } = req.body;

//         if (!history || !Array.isArray(history) || history.length === 0) {
//             return res.status(400).json({
//                 error: "No conversation history provided",
//                 message: "Please provide the interview conversation history",
//             });
//         }

//         const analysis = await analyzeInterview(history);

//         res.json({
//             success: true,
//             analysis: analysis,
//         });
//     } catch (error) {
//         console.error("Analysis middleware error:", error);
//         res.status(500).json({
//             success: false,
//             error: "Analysis failed",
//             message: error.message,
//         });
//     }
// };

// module.exports = {
//     transcribeAudio,
//     getChatResponse,
//     transcribeAudioMiddleware,
//     getChatResponseMiddleware,
//     analyzeInterview,
//     analyzeInterviewMiddleware,
// };
