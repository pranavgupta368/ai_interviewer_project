const Job = require("../models/Job");

const createJob = async (jobData) => {
  try {
    const job = new Job(jobData);
    await job.save();

    console.log("Job created:", job._id);
    return job;
  } catch (error) {
    console.error("Job creation error:", error);
    throw new Error(`Failed to create job: ${error.message}`);
  }
};

const getJob = async (jobId) => {
  try {
    const job = await Job.findById(jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    console.log("Job retrieved:", job.roleTitle);
    return job;
  } catch (error) {
    console.error("Job retrieval error:", error);
    throw new Error(`Failed to retrieve job: ${error.message}`);
  }
};

const createJobMiddleware = async (req, res) => {
  try {
    const { roleTitle, jobDescription, difficulty } = req.body;

    if (!roleTitle || !jobDescription || !difficulty) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: "Please provide roleTitle, jobDescription, and difficulty",
      });
    }

    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        error: "Invalid difficulty",
        message: "Difficulty must be Easy, Medium, or Hard",
      });
    }

    const job = await createJob({ roleTitle, jobDescription, difficulty });

    res.status(201).json({
      success: true,
      data: {
        id: job._id,
        roleTitle: job.roleTitle,
        difficulty: job.difficulty,
        createdAt: job.createdAt,
      },
    });
  } catch (error) {
    console.error("Create job middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Job creation failed",
      message: error.message,
    });
  }
};

const getJobMiddleware = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Missing job ID",
        message: "Please provide a job ID",
      });
    }

    const job = await getJob(id);

    res.json({
      success: true,
      data: {
        id: job._id,
        roleTitle: job.roleTitle,
        jobDescription: job.jobDescription,
        difficulty: job.difficulty,
        createdAt: job.createdAt,
      },
    });
  } catch (error) {
    console.error("Get job middleware error:", error);
    res.status(404).json({
      success: false,
      error: "Job not found",
      message: error.message,
    });
  }
};

module.exports = {
  createJob,
  getJob,
  createJobMiddleware,
  getJobMiddleware,
};
