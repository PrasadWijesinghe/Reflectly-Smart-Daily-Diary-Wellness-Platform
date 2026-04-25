const prisma = require("../utils/prisma");
const { incrementFeedbackSubmitted } = require("../utils/metrics");

async function submitFeedback(req, res) {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Feedback message is required." });
    }

    const feedback = await prisma.feedback.create({
      data: {
        message: message.trim(),
      },
    });

    incrementFeedbackSubmitted();
    return res.status(201).json({ success: true, feedback });
  } catch (err) {
    console.error("Submit feedback error:", err);
    return res.status(500).json({ error: "Failed to submit feedback." });
  }
}

module.exports = {
  submitFeedback,
};
