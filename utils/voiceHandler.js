const { spawn } = require("child_process");
const path = require("path");

const generateSpeech = (text) => {
  return new Promise((resolve, reject) => {
    if (!text || text.trim() === "") {
      return reject(new Error("Text is required for speech generation"));
    }

    const scriptPath = path.join(__dirname, "..", "python-scripts", "tts.py");

    const pythonExecutable = process.env.PYTHON_EXECUTABLE || "python";

    const pythonProcess = spawn(pythonExecutable, [scriptPath, text]);

    let outputData = "";
    let errorData = "";

    pythonProcess.stdout.on("data", (data) => {
      outputData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        const match = outputData.match(/SUCCESS:(.+)/);

        if (match && match[1]) {
          const filename = match[1].trim();
          const audioUrl = `/audio/${filename}`;

          resolve({
            success: true,
            filename: filename,
            audioUrl: audioUrl,
          });
        } else {
          reject(new Error("Failed to parse output from Python script"));
        }
      } else {
        const errorMatch = errorData.match(/ERROR:(.+)/);
        const errorMessage = errorMatch
          ? errorMatch[1].trim()
          : "Unknown error occurred";

        reject(new Error(`Python script failed: ${errorMessage}`));
      }
    });

    pythonProcess.on("error", (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
};

const generateSpeechMiddleware = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: "Text is required",
        message: "Please provide text in the request body",
      });
    }

    const result = await generateSpeech(text);

    res.json({
      success: true,
      message: "Speech generated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Voice generation error:", error);

    res.status(500).json({
      success: false,
      error: "Speech generation failed",
      message: error.message,
    });
  }
};

module.exports = {
  generateSpeech,
  generateSpeechMiddleware,
};
