import prisma from "../lib/prisma.js";
import wrapAsync from "../utils/wrapAsync.js";

const MAX_CODE_SIZE = 50 * 1024;

const createSubmission = async (req, res) => {
  const { attemptId, language, code, explanation } = req.body;

  // Check required fields
  if (!code?.trim() || !explanation?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Code and explanation are required.",
    });
  }

  // Calculate code size
  const codeSize = Buffer.byteLength(code, "utf8");

  // Check code size
  if (codeSize > MAX_CODE_SIZE) {
    return res.status(400).json({
      success: false,
      message: "Code must be 50 KB or smaller.",
    });
  }

  // Check attempt
  const attempt = await prisma.attempt.findUnique({
    where: {
      id: Number(attemptId),
    },
  });

  if (!attempt) {
    return res.status(404).json({
      success: false,
      message: "Attempt not found",
    });
  }

  // Create submission
  const submission = await prisma.submission.create({
    data: {
      attemptId: Number(attemptId),
      language,
      code,
      codeSize,
      explanation,
      status: "PENDING",
    },
  });

  // Update attempt status
  await prisma.attempt.update({
    where: {
      id: Number(attemptId),
    },
    data: {
      status: "SUBMITTED",
    },
  });

  res.status(201).json({
    success: true,
    message: "Solution submitted successfully",
    submission,
  });
};

export const submitSolution = wrapAsync(createSubmission);