const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseResumeMiddleware } = require('../controllers/resumeController');

// Configure multer for PDF file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads');

        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only accept PDF files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

/**
 * @route   POST /api/resume/parse
 * @desc    Upload and parse resume PDF to extract candidate information
 * @access  Public
 * 
 * Request:
 * - Form-data with 'resume' file field (PDF only)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "fullName": "John Doe",
 *     "technicalSkills": ["React", "Node.js", "MongoDB"],
 *     "mostImpressiveProject": "Built a real-time chat application..."
 *   }
 * }
 */
router.post('/parse', upload.single('resume'), parseResumeMiddleware);

/**
 * @route   GET /api/resume/health
 * @desc    Health check for resume service
 * @access  Public
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Resume Parser',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
