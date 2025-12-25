const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    roleTitle: {
        type: String,
        required: true,
        trim: true
    },
    jobDescription: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    duration: {
        type: String,
        required: true,
        enum: ['Short (15 min)', 'Standard (30 min)', 'Deep Dive (60 min)'],
        default: 'Standard (30 min)'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Job', JobSchema);
