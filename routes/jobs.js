const express = require("express");
const router = express.Router();
const {
  createJobMiddleware,
  getJobMiddleware,
} = require("../controllers/jobController");

router.post("/create", createJobMiddleware);

router.get("/:id", getJobMiddleware);

router.get("/check/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Jobs Service",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
