const Interview = require("../models/Interview");

const getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .sort({ createdAt: -1 })
      .select(
        "candidateName jobRole difficulty duration technicalScore communicationScore confidenceScore createdAt"
      );

    console.log(`Retrieved ${interviews.length} interviews from database`);

    res.json({
      success: true,
      data: interviews,
    });
  } catch (error) {
    console.error("Failed to fetch interviews:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch interviews",
      message: error.message,
    });
  }
};

module.exports = { getAllInterviews };
