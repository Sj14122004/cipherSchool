import prisma from "../lib/prisma.js";
import wrapAsync from "../utils/wrapAsync.js";

const getProblems = async (req, res) => {
  const problems = await prisma.problem.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({
    success: true,
    problems,
  });
};

export const getAllProblems = wrapAsync(getProblems);

const getProblem = async (req, res) => {
  const { id } = req.params;

  const problem = await prisma.problem.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!problem) {
    return res.status(404).json({
      success: false,
      message: "Problem not found",
    });
  }
};

export const getSingleProblem = wrapAsync(getProblem);