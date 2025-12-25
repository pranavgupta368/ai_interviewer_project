const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema({
    candidateName: {
        type: String,
        required: true,
    },
    jobRole: {
        type: String,
        default: "Practice Interview",
    },
    difficulty: {
        type: String,
        default: "N/A",
    },
    duration: {
        type: String,
        default: "N/A",
    },
    technicalScore: {
        type: Number,
        default: 0,
    },
    communicationScore: {
        type: Number,
        default: 0,
    },
    confidenceScore: {
        type: Number,
        default: 0,
    },
    feedback: {
        type: Array,
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Interview", InterviewSchema);
