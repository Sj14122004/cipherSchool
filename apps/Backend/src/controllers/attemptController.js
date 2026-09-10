import prisma from "../lib/prisma.js";
import wrapAsync from "../utils/wrapAsync.js";

const startAttempt = async (req, res) => {
  const { problemId } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email: "test@example.com",
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Test user not found",
    });
  }

  const userId = user.id; // temporary test user

  const problem = await prisma.problem.findUnique({
    where: {
      id: Number(problemId),
    },
  });

  if (!problem) {
    return res.status(404).json({
      success: false,
      message: "Problem not found",
    });
  }

  const lastAttempt = await prisma.attempt.findFirst({
    where: {
      userId,
      problemId: Number(problemId),
    },
    orderBy: {
      attemptNumber: "desc",
    },
  });

  const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

  const attempt = await prisma.attempt.create({
    data: {
      userId,
      problemId: Number(problemId),
      attemptNumber,
    },
  });

  res.status(201).json({
    success: true,
    message: "Attempt started",
    attempt,
  });
};

export const createAttempt = wrapAsync(startAttempt);

const getAttemptHistory = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      email: "test@example.com",
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Test user not found",
    });
  }

  const attempts = await prisma.attempt.findMany({
    where: {
      userId: user.id,
    },
    include: {
      problem: true,
      submission: {
        include: {
          evaluation: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({
    success: true,
    attempts,
  });
};

export const getHistory = wrapAsync(getAttemptHistory);

const getSingleAttempt = async (req, res) => {
  const { id } = req.params;

  const attempt = await prisma.attempt.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      problem: true,
    },
  });

  if (!attempt) {
    return res.status(404).json({
      success: false,
      message: "Attempt not found",
    });
  }

  res.status(200).json({
    success: true,
    attempt,
  });
};

export const getAttempt = wrapAsync(getSingleAttempt);

const retryAttempt = async (req, res) => {
  const { id } = req.params;

  const attempt = await prisma.attempt.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      submission: true,
    },
  });

  if (!attempt) {
    return res.status(404).json({
      success: false,
      message: "Attempt not found.",
    });
  }

  if (attempt.status !== "FAILED") {
    return res.status(400).json({
      success: false,
      message: "Only failed attempts can be retried.",
    });
  }

  if (attempt.submission) {
    await prisma.submission.delete({
      where: {
        id: attempt.submission.id,
      },
    });
  }

  await prisma.attempt.update({
    where: {
      id: attempt.id,
    },
    data: {
      status: "IN_PROGRESS",
    },
  });

  res.status(200).json({
    success: true,
    message: "Attempt reset. You can try again.",
    attemptId: attempt.id,
    attemptNumber: attempt.attemptNumber,
  });
};

export const retry = wrapAsync(retryAttempt);