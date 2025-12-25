const { spawn } = require('child_process');
const path = require('path');

/**
 * Voice Handler Utility
 * Handles text-to-speech conversion using Python edge-tts library
 */

/**
 * Generate speech from text using edge-tts Python script
 * 
 * @param {string} text - The text to convert to speech
 * @returns {Promise<{success: boolean, filename?: string, audioUrl?: string, error?: string}>}
 */
const generateSpeech = (text) => {
    return new Promise((resolve, reject) => {
        if (!text || text.trim() === '') {
            return reject(new Error('Text is required for speech generation'));
        }

        // Path to Python script
        const scriptPath = path.join(__dirname, '..', 'python-scripts', 'tts.py');

        // Python executable (can be configured via environment variable)
        const pythonExecutable = process.env.PYTHON_EXECUTABLE || 'python';

        // Spawn Python process
        const pythonProcess = spawn(pythonExecutable, [scriptPath, text]);

        let outputData = '';
        let errorData = '';

        // Capture stdout
        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        // Capture stderr
        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        // Handle process completion
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                // Parse output to get filename
                const match = outputData.match(/SUCCESS:(.+)/);

                if (match && match[1]) {
                    const filename = match[1].trim();
                    const audioUrl = `/audio/${filename}`;

                    resolve({
                        success: true,
                        filename: filename,
                        audioUrl: audioUrl
                    });
                } else {
                    reject(new Error('Failed to parse output from Python script'));
                }
            } else {
                // Extract error message
                const errorMatch = errorData.match(/ERROR:(.+)/);
                const errorMessage = errorMatch ? errorMatch[1].trim() : 'Unknown error occurred';

                reject(new Error(`Python script failed: ${errorMessage}`));
            }
        });

        // Handle process errors
        pythonProcess.on('error', (error) => {
            reject(new Error(`Failed to start Python process: ${error.message}`));
        });
    });
};

/**
 * Express middleware wrapper for voice generation
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateSpeechMiddleware = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                error: 'Text is required',
                message: 'Please provide text in the request body'
            });
        }

        const result = await generateSpeech(text);

        res.json({
            success: true,
            message: 'Speech generated successfully',
            data: result
        });
    } catch (error) {
        console.error('Voice generation error:', error);

        res.status(500).json({
            success: false,
            error: 'Speech generation failed',
            message: error.message
        });
    }
};

module.exports = {
    generateSpeech,
    generateSpeechMiddleware
};
