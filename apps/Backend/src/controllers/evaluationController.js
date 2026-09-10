import prisma from "../lib/prisma.js";
import wrapAsync from "../utils/wrapAsync.js";
import compileJava from "../utils/compileJava.js";
import runJavaTests from "../utils/runJavaTests.js";
import detectEdgeCases from "../utils/edgeCaseDetector.js";
import GroqEvaluator from "../evaluators/GroqEvaluator.js";

const stripComments = (code) => {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
};

const getMeaningfulLines = (code) => {
  return stripComments(code)
    .split(/[\n;]/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const isPlaceholderLine = (line) => {
  const normalized = line
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  return (
    normalized === "return null" ||
    normalized === "return 0" ||
    normalized === "return false" ||
    normalized === "return true" ||
    normalized === 'return ""' ||
    normalized === "return ''" ||
    normalized.includes("todo") ||
    normalized.includes("implement here") ||
    normalized.includes("your code here")
  );
};

const analyzeImplementation = (
  code,
  minimumRequiredLines = 5
) => {
  const meaningfulLines = getMeaningfulLines(code);

  const placeholderLines = meaningfulLines.filter(
    isPlaceholderLine
  );

  const implementationLines = meaningfulLines.filter(
    (line) => !isPlaceholderLine(line)
  );

  return {
    totalMeaningfulLines: meaningfulLines.length,
    implementationLines: implementationLines.length,
    placeholderCount: placeholderLines.length,
    hasPlaceholderOnlyCode:
      implementationLines.length === 0,
    minimumRequiredLines,
    passed:
      implementationLines.length >= minimumRequiredLines &&
      implementationLines.length > placeholderLines.length,
  };
};

const countClasses = (code) => {
  const matches = code.match(
    /\bclass\s+[A-Za-z_$][\w$]*/g
  );

  return matches ? matches.length : 0;
};

const countMethods = (code) => {
  const matches = code.match(
    /\b(?:public|private|protected)?\s*(?:static\s+)?[\w<>\[\], ?]+\s+[A-Za-z_$][\w$]*\s*\([^;{}]*\)\s*\{/g
  );

  return matches ? matches.length : 0;
};

const checkNaming = (code) => {
  const classNames =
    code.match(
      /\bclass\s+([A-Za-z_$][\w$]*)/g
    ) || [];

  const invalidClassNames = classNames.filter(
    (declaration) => {
      const name = declaration
        .replace(/^class\s+/, "")
        .trim();

      return !/^[A-Z][A-Za-z0-9_$]*$/.test(name);
    }
  );

  return invalidClassNames.length === 0;
};

const checkComplexity = (code) => {
  const ifCount =
    (code.match(/\bif\s*\(/g) || []).length;

  const loopCount =
    (code.match(/\b(for|while|do)\s*\b/g) || [])
      .length;

  const switchCount =
    (code.match(/\bswitch\s*\(/g) || []).length;

  const total =
    ifCount +
    loopCount +
    switchCount;

  return {
    score: total,
    acceptable: total <= 20,
  };
};

const checkObviousProblems = (code) => {
  const problems = [];

  if (/System\.exit\s*\(/.test(code)) {
    problems.push(
      "System.exit() should not be used."
    );
  }

  if (/while\s*\(\s*true\s*\)/.test(code)) {
    problems.push(
      "Potential infinite loop detected."
    );
  }

  if (
    /catch\s*\([^)]*\)\s*\{\s*\}/.test(code)
  ) {
    problems.push(
      "Empty catch block detected."
    );
  }

  return problems;
};

const checkCodeSize = (code) => {
  const MAX_CODE_SIZE = 50 * 1024;

  const size = Buffer.byteLength(
    code,
    "utf8"
  );

  return {
    size,
    passed: size <= MAX_CODE_SIZE,
  };
};

const runAutomatedChecks = (code, problem) => {
  const rules = problem.evaluationRules || {};

  const minimumMeaningfulLines =
    rules.minimumMeaningfulLines || 5;

  const minimumMethodCount =
    rules.minimumMethodCount || 1;

  const implementation = analyzeImplementation(
    code,
    minimumMeaningfulLines
  );

  const classCount = countClasses(code);
  const methodCount = countMethods(code);
  const namingPassed = checkNaming(code);
  const complexity = checkComplexity(code);
  const obviousProblems = checkObviousProblems(code);
  const codeSize = checkCodeSize(code);

  const errors = [];
  const warnings = [];

  if (!code || !code.trim()) {
    errors.push("Code is required.");
  }

  if (!implementation.passed) {
    errors.push(
      "Submission does not contain enough meaningful implementation."
    );
  }

  if (!codeSize.passed) {
    errors.push(
      "Code exceeds the 50 KB limit."
    );
  }

  if (methodCount < minimumMethodCount) {
    errors.push(
      `At least ${minimumMethodCount} method(s) are expected.`
    );
  }

  if (!namingPassed) {
    warnings.push(
      "Some class names do not follow standard Java naming conventions."
    );
  }

  if (!complexity.acceptable) {
    warnings.push(
      "Code may have high control-flow complexity."
    );
  }

  warnings.push(...obviousProblems);

  return {
    passed: errors.length === 0,
    errors,
    warnings,

    metrics: {
      codeSize: codeSize.size,
      meaningfulLines:
        implementation.totalMeaningfulLines,
      classCount,
      methodCount,
      placeholderCount:
        implementation.placeholderCount,
    },

    checks: {
      requiredFields:
        code && code.trim()
          ? "PASS"
          : "FAIL",

      codeSize:
        codeSize.passed
          ? "PASS"
          : "FAIL",

      implementation:
        implementation.passed
          ? "PASS"
          : "FAIL",

      methodCount:
        methodCount >= minimumMethodCount
          ? "PASS"
          : "FAIL",

      naming:
        namingPassed
          ? "PASS"
          : "WARNING",

      complexity:
        complexity.acceptable
          ? "PASS"
          : "WARNING",

      obviousProblems:
        obviousProblems.length === 0
          ? "PASS"
          : "WARNING",
    },

    implementation,

    problemRules: {
      requiredBehaviors:
        rules.requiredBehaviors || [],

      edgeCases:
        rules.edgeCases || [],

      requiresState:
        rules.requiresState || false,

      minimumMeaningfulLines,

      minimumMethodCount,

      performance:
        rules.performance || null,
    },
  };
};

const evaluateSubmission = async (req, res) => {
  const { submissionId } = req.body;

  if (!submissionId) {
    return res.status(400).json({
      success: false,
      message: "submissionId is required.",
    });
  }

  const submission =
    await prisma.submission.findUnique({
      where: {
        id: Number(submissionId),
      },
      include: {
        attempt: {
          include: {
            problem: true,
          },
        },
      },
    });

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: "Submission not found.",
    });
  }

  const attempt = submission.attempt;
  const problem = attempt?.problem;

  if (!attempt) {
    return res.status(404).json({
      success: false,
      message: "Attempt not found.",
    });
  }

  if (!problem) {
    return res.status(404).json({
      success: false,
      message: "Problem not found.",
    });
  }

  const automated = runAutomatedChecks(
    submission.code,
    problem
  );

  if (!automated.passed) {
    await prisma.submission.update({
      where: {
        id: submission.id,
      },
      data: {
        status: "INVALID",
      },
    });

    await prisma.attempt.update({
      where: {
        id: attempt.id,
      },
      data: {
        status: "FAILED",
      },
    });

    return res.status(400).json({
      success: false,
      message:
        "Submission failed automated validation.",
      layer1Status: "FAIL",
      automated,
      nextStep:
        "Fix the submission and submit again.",
    });
  }

  const compilation = await compileJava(
    submission.code,
    problem.executionContract
  );

  if (!compilation.passed) {
    await prisma.submission.update({
      where: {
        id: submission.id,
      },
      data: {
        status: "INVALID",
      },
    });

    await prisma.attempt.update({
      where: {
        id: attempt.id,
      },
      data: {
        status: "FAILED",
      },
    });

    return res.status(400).json({
      success: false,
      message: "Java compilation failed.",
      layer1Status: "FAIL",
      automated,
      compilation,
      nextStep:
        "Fix the compilation errors and submit again.",
    });
  }

  const testResult = await runJavaTests(
    submission.code,
    problem.testCases || [],
    problem.executionContract || {}
  );

  const edgeCaseResult = detectEdgeCases(
    submission.code,
    {
      concurrencyRequired: false,
    }
  );

  let layer1Status = "PASS";

  if (testResult.status === "FAIL") {
    layer1Status = "FAIL";
  } else if (
    testResult.status === "WARNING" ||
    edgeCaseResult.status === "WARNING" ||
    automated.warnings.length > 0
  ) {
    layer1Status = "WARNING";
  }

  if (layer1Status === "FAIL") {
  await prisma.submission.update({
    where: {
      id: submission.id,
    },
    data: {
      status: "INVALID",
    },
  });

  await prisma.attempt.update({
    where: {
      id: attempt.id,
    },
    data: {
      status: "FAILED",
    },
  });

  const failedEvaluation =
    await prisma.evaluation.upsert({
      where: {
        submissionId: submission.id,
      },

      update: {
        status: "FAILED",
        score: 0,
        responsibilityScore: 0,
        abstractionScore: 0,
        extensibilityScore: 0,
        designPatternScore: 0,
        codeQualityScore: 0,

        strengths: null,

        weaknesses:
          "The solution failed automated behavioral evaluation.",

        suggestions:
          "Fix the failing automated tests and submit the solution again.",

        error:
          "Layer 1 evaluation failed. AI evaluation was skipped.",
      },

      create: {
        submissionId: submission.id,
        status: "FAILED",
        score: 0,
        responsibilityScore: 0,
        abstractionScore: 0,
        extensibilityScore: 0,
        designPatternScore: 0,
        codeQualityScore: 0,

        strengths: null,

        weaknesses:
          "The solution failed automated behavioral evaluation.",

        suggestions:
          "Fix the failing automated tests and submit the solution again.",

        error:
          "Layer 1 evaluation failed. AI evaluation was skipped.",
      },
    });

  return res.status(200).json({
    success: true,
    message: "Solution failed automated evaluation.",
    layer1Status,
    automated,
    compilation,
    tests: testResult,
    edgeCases: edgeCaseResult,
    aiEvaluation: failedEvaluation,
    nextStep:
      "Fix failing automated tests before AI evaluation.",
    });
  }

  await prisma.submission.update({
    where: {
      id: submission.id,
    },
    data: {
      status: "VALID",
    },
  });

  await prisma.attempt.update({
    where: {
      id: attempt.id,
    },
    data: {
      status: "EVALUATING",
    },
  });

  try {
    const startTime = Date.now();

    const evaluator = new GroqEvaluator();

    const aiResult = await evaluator.evaluate({
      problem,
      submission,
      testResult,
      edgeCaseResult,
    });

    const evaluationTime =
      Date.now() - startTime;

    const evaluation =
      await prisma.evaluation.upsert({
        where: {
          submissionId: submission.id,
        },

        update: {
          status: "COMPLETED",
          score: aiResult.score,
          responsibilityScore:
            aiResult.responsibilityScore,
          abstractionScore:
            aiResult.abstractionScore,
          extensibilityScore:
            aiResult.extensibilityScore,
          designPatternScore:
            aiResult.designPatternScore,
          codeQualityScore:
            aiResult.codeQualityScore,

          strengths:
            Array.isArray(aiResult.strengths)
              ? aiResult.strengths.join("\n")
              : aiResult.strengths || null,

          weaknesses:
            Array.isArray(aiResult.weaknesses)
              ? aiResult.weaknesses.join("\n")
              : aiResult.weaknesses || null,

          suggestions:
            Array.isArray(aiResult.suggestions)
              ? aiResult.suggestions.join("\n")
              : aiResult.suggestions || null,

          aiModel:
            process.env.GROQ_MODEL ||
            "openai/gpt-oss-20b",

          evaluationTime,
          evaluatedAt: new Date(),
          error: null,
        },

        create: {
          submissionId: submission.id,
          status: "COMPLETED",
          score: aiResult.score,
          responsibilityScore:
            aiResult.responsibilityScore,
          abstractionScore:
            aiResult.abstractionScore,
          extensibilityScore:
            aiResult.extensibilityScore,
          designPatternScore:
            aiResult.designPatternScore,
          codeQualityScore:
            aiResult.codeQualityScore,

          strengths:
            Array.isArray(aiResult.strengths)
              ? aiResult.strengths.join("\n")
              : aiResult.strengths || null,

          weaknesses:
            Array.isArray(aiResult.weaknesses)
              ? aiResult.weaknesses.join("\n")
              : aiResult.weaknesses || null,

          suggestions:
            Array.isArray(aiResult.suggestions)
              ? aiResult.suggestions.join("\n")
              : aiResult.suggestions || null,

          aiModel:
            process.env.GROQ_MODEL ||
            "openai/gpt-oss-20b",

          evaluationTime,
          evaluatedAt: new Date(),
        },
      });

    await prisma.submission.update({
      where: {
        id: submission.id,
      },
      data: {
        status: "EVALUATED",
      },
    });

    await prisma.attempt.update({
      where: {
        id: attempt.id,
      },
      data: {
        status: "COMPLETED",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Evaluation completed.",
      layer1Status,
      automated,
      compilation,
      tests: testResult,
      edgeCases: edgeCaseResult,
      aiEvaluation: evaluation,
      nextStep:
        "Review your feedback and try the problem again.",
    });
  } catch (error) {
    console.error(
      "AI evaluation failed:",
      error
    );

    await prisma.evaluation.upsert({
      where: {
        submissionId: submission.id,
      },

      update: {
        status: "FAILED",
        error:
          error.message ||
          "AI evaluation failed.",
      },

      create: {
        submissionId: submission.id,
        status: "FAILED",
        error:
          error.message ||
          "AI evaluation failed.",
      },
    });

    await prisma.submission.update({
      where: {
        id: submission.id,
      },
      data: {
        status: "INVALID",
      },
    });

    await prisma.attempt.update({
      where: {
        id: attempt.id,
      },
      data: {
        status: "FAILED",
      },
    });

    return res.status(500).json({
      success: false,
      message: "AI evaluation failed.",
      error:
        error.message ||
        "Unknown AI evaluation error.",
      layer1Status,
      automated,
      compilation,
      tests: testResult,
      edgeCases: edgeCaseResult,
      nextStep:
        "Retry the AI evaluation.",
    });
  }
};


const getEvaluation = async (req, res) => {
  const { submissionId } = req.params;

  const evaluation = await prisma.evaluation.findUnique({
    where: {
      submissionId: Number(submissionId),
    },
    include: {
      submission: {
        include: {
          attempt: {
            include: {
              problem: true,
            },
          },
        },
      },
    },
  });

  if (!evaluation) {
    return res.status(404).json({
      success: false,
      message: "Evaluation not found.",
    });
  }

  res.status(200).json({
    success: true,
    evaluation,
  });
};

export const evaluateSolution = wrapAsync(
  evaluateSubmission
);

export const getSubmissionEvaluation = wrapAsync(
  getEvaluation
);

