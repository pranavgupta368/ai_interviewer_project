const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  transcribeAudio,
  getChatResponse,
} = require("../controllers/aiController");
const { generateSpeech } = require("../utils/voiceHandler");
const { getAllInterviews } = require("../controllers/interviewController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "audio-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/webm",
    "audio/ogg",
    "audio/m4a",
    "audio/x-m4a",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only audio files are allowed."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.post("/process", upload.single("audio"), async (req, res) => {
  let uploadedFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No audio file provided",
        message: "Please upload an audio file",
      });
    }

    uploadedFilePath = req.file.path;
    console.log("Audio file uploaded:", uploadedFilePath);

    console.log("Transcribing audio...");
    const userTranscript = await transcribeAudio(uploadedFilePath);
    console.log("Transcription:", userTranscript);

    let conversationHistory = [];
    if (req.body.history) {
      try {
        conversationHistory = JSON.parse(req.body.history);
      } catch (e) {
        console.warn("⚠️ Failed to parse conversation history:", e.message);
      }
    }

    let resumeContext = null;
    if (req.body.context) {
      try {
        resumeContext = JSON.parse(req.body.context);
        console.log("Resume context received for:", resumeContext.fullName);
      } catch (e) {
        console.warn("Failed to parse resume context:", e.message);
      }
    }

    console.log("Getting AI response...");
    const aiTranscript = await getChatResponse(
      userTranscript,
      conversationHistory,
      resumeContext
    );
    console.log("AI Response:", aiTranscript);

    console.log("Generating speech...");
    const voiceResult = await generateSpeech(aiTranscript);
    console.log("Voice generated:", voiceResult.audioUrl);

    if (fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
      console.log("Cleaned up uploaded file");
    }

    res.json({
      success: true,
      audioUrl: voiceResult.audioUrl,
      userTranscript: userTranscript,
      aiTranscript: aiTranscript,
      filename: voiceResult.filename,
    });
  } catch (error) {
    console.error("Interview processing error:", error);

    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
        console.log("Cleaned up uploaded file after error");
      } catch (cleanupError) {
        console.error("Failed to clean up file:", cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      error: "Interview processing failed",
      message: error.message,
    });
  }
});

router.post("/analyze", async (req, res) => {
  try {
    const { history } = req.body;

    if (!history || !Array.isArray(history) || history.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No conversation history provided",
        message: "Please provide the interview conversation history",
      });
    }

    const { analyzeInterview } = require("../controllers/aiController");
    const analysis = await analyzeInterview(history);

    res.json({
      success: true,
      analysis: analysis,
    });
  } catch (error) {
    console.error("Analysis error:", error);

    res.status(500).json({
      success: false,
      error: "Analysis failed",
      message: error.message,
    });
  }
});

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Interview Orchestrator",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
