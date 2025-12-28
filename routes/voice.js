const express = require("express");
const router = express.Router();
const {
  generateSpeechMiddleware,
  generateSpeech,
} = require("../utils/voiceHandler");

router.post("/generate", generateSpeechMiddleware);

router.post("/generate-custom", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: "Text is required",
      });
    }

    console.log(`Generating speech for: "${text.substring(0, 50)}..."`);

    const result = await generateSpeech(text);

    res.json({
      success: true,
      message: "Speech generated successfully",
      data: {
        filename: result.filename,
        audioUrl: result.audioUrl,
        textLength: text.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Voice generation error:", error);

    res.status(500).json({
      success: false,
      error: "Speech generation failed",
      message: error.message,
    });
  }
});

router.get("/test", async (req, res) => {
  try {
    const sampleText =
      "Hello! This is a test of the AI Interviewer voice generation system. Welcome to your interview.";

    const result = await generateSpeech(sampleText);

    res.json({
      success: true,
      message: "Test speech generated successfully",
      data: result,
      sampleText: sampleText,
    });
  } catch (error) {
    console.error("Test generation error:", error);

    res.status(500).json({
      success: false,
      error: "Test failed",
      message: error.message,
    });
  }
});

module.exports = router;
