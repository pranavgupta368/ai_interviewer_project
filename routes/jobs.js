const express = require('express');
const router = express.Router();
const { createJobMiddleware, getJobMiddleware } = require('../controllers/jobController');

/**
 * @route   POST /api/jobs/create
 * @desc    Create a new job posting and get interview link
 * @access  Public
 * 
 * Request Body:
 * {
 *   "roleTitle": "Senior React Developer",
 *   "jobDescription": "We need someone with 5+ years React experience...",
 *   "difficulty": "Hard"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "507f1f77bcf86cd799439011",
 *     "roleTitle": "Senior React Developer",
 *     "difficulty": "Hard",
 *     "createdAt": "2024-01-15T10:30:00.000Z"
 *   }
 * }
 */
router.post('/create', createJobMiddleware);

/**
 * @route   GET /api/jobs/:id
 * @desc    Get job details by ID
 * @access  Public
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "507f1f77bcf86cd799439011",
 *     "roleTitle": "Senior React Developer",
 *     "jobDescription": "We need someone with...",
 *     "difficulty": "Hard",
 *     "createdAt": "2024-01-15T10:30:00.000Z"
 *   }
 * }
 */
router.get('/:id', getJobMiddleware);

/**
 * @route   GET /api/jobs/health
 * @desc    Health check for jobs service
 * @access  Public
 */
router.get('/check/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Jobs Service',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
