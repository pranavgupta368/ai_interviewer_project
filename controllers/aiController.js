const Groq = require("groq-sdk");
const fs = require("fs");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT =
  "You are a professional, polite technical interviewer. Your goal is to assess the candidate. Keep your answers concise (max 2 sentences) to keep the voice conversation natural. Do not be repetitive.";

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

const getChatResponse = async (
  userMessage,
  conversationHistory = [],
  context = null,
  jobContext = null
) => {
  try {
    let systemPrompt = SYSTEM_PROMPT;

    if (jobContext) {
      const jobPrefix = `You are interviewing for the role: ${jobContext.roleTitle}. 
Job Requirements: ${jobContext.jobDescription}
Difficulty Level: ${jobContext.difficulty}
Adjust your questions and expectations based on this ${jobContext.difficulty} difficulty level. `;
      systemPrompt = jobPrefix + SYSTEM_PROMPT;
      console.log("Using job-specific context for interview");
    }

    if (context) {
      const contextPrefix = `The candidate is ${context.fullName}. Skills: ${
        context.technicalSkills?.join(", ") || "Not specified"
      }. Focus questions on: ${
        context.mostImpressiveProject || "their experience"
      }. `;
      systemPrompt = contextPrefix + systemPrompt;
      console.log("Using resume-aware context for interview");
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

const analyzeInterview = async (conversationHistory, jobContext = null) => {
  try {
    const transcript = conversationHistory
      .map(
        (msg) =>
          `${msg.role === "user" ? "Candidate" : "Interviewer"}: ${msg.content}`
      )
      .join("\n\n");

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

    let rawContent = completion.choices[0]?.message?.content || "{}";

    let cleanJson = rawContent
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let analysis;
    try {
      analysis = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("JSON Parse Failed on:", cleanJson);
      analysis = {
        technical_score: 0,
        communication_score: 0,
        confidence_score: 0,
        feedback: [],
      };
    }

    if (typeof analysis.technical_score !== "number")
      analysis.technical_score = 70;
    if (typeof analysis.communication_score !== "number")
      analysis.communication_score = 70;
    if (typeof analysis.confidence_score !== "number")
      analysis.confidence_score = 70;

    if (!Array.isArray(analysis.feedback) || analysis.feedback.length === 0) {
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

    console.log("Analyzing interview for:", candidateName, "| Role:", jobRole);

    const analysis = await analyzeInterview(history, jobContext || null);

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
      console.log("Interview saved to database:", savedInterview._id);
    } catch (dbError) {
      console.error("Database save failed:", dbError.message);
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
