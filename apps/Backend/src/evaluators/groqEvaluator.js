import Groq from "groq-sdk";
import Evaluator from "./evaluator.js";

class GroqEvaluator extends Evaluator {
  async evaluate({
    problem,
    submission,
    testResult,
    edgeCaseResult,
  }) {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const prompt = `
You are an expert Low-Level Design interviewer evaluating a student's solution.

Your job is to give fair, evidence-based feedback.

IMPORTANT EVALUATION RULES:

1. Automated test results are actual behavioral evidence.
   - If a test PASSED, do NOT say that behavior is completely missing.
   - If a test FAILED, identify that behavior as an implementation problem.
   - Do not contradict the automated test results.

2. Compilation success only proves that the code compiles.
   It does NOT prove good LLD.

3. Edge-case detector results are only code-pattern signals.
   They do NOT prove that an edge case is correctly implemented.
   Use them as supporting evidence, not as definitive proof.

4. Evaluate the student's actual code.
   Do not assume classes, patterns, or functionality that are not present.

5. Multiple LLD designs can be valid.
   Do not require a particular design pattern unless it improves the design
   or the problem requirements clearly justify it.

6. A design pattern should NOT receive a high score simply because the student
   used one. Judge whether the abstraction is actually useful.

7. Evaluate the student's explanation together with the code.
   If the explanation claims something that the code does not implement,
   mention the mismatch.

8. Do not criticize the solution for not handling irrelevant concerns.

9. Give constructive feedback suitable for a learner.

10. Return ONLY valid JSON.

PROBLEM:

Title:
${problem.title}

Description:
${problem.description}

Requirements:
${problem.requirements}

Constraints:
${problem.constraints || "None"}

Expected Behavior:
${problem.expectedBehavior || "None"}

Evaluation Rules:
${JSON.stringify(problem.evaluationRules || {}, null, 2)}

EXECUTION CONTRACT:
${JSON.stringify(problem.executionContract || {}, null, 2)}

STUDENT CODE:

${submission.code}

STUDENT EXPLANATION:

${submission.explanation}

AUTOMATED TEST RESULTS:

${JSON.stringify(testResult, null, 2)}

EDGE CASE ANALYSIS:

${JSON.stringify(edgeCaseResult, null, 2)}

Evaluate the solution using these dimensions:

1. Responsibility Separation
   - Are responsibilities clearly separated?
   - Does each class/object have a meaningful responsibility?
   - Is there excessive responsibility in one class?

2. Abstraction
   - Are appropriate abstractions used?
   - Are interfaces/classes introduced where they provide real value?
   - Is the design unnecessarily complicated?

3. Extensibility
   - How easily can requirements change?
   - Can new behavior be added without heavily modifying existing code?

4. Design Patterns
   - Are design patterns used appropriately?
   - If no pattern is used, determine whether one is actually beneficial.
   - Do not penalize the student simply for not using a pattern.

5. Code Quality
   - Readability
   - Naming
   - Method organization
   - Duplication
   - Maintainability
   - Error handling where relevant

6. Explanation Quality
   - Does the explanation correctly describe the implementation?
   - Does it explain important design decisions?
   - Does it mention trade-offs?

7. Requirements Coverage
   - Compare the requirements with the automated tests and actual code.
   - Clearly distinguish between:
     * verified working behavior
     * failed behavior
     * behavior that cannot be verified automatically

8. Edge Cases
   - Consider the problem's defined edge cases.
   - Use automated test results as stronger evidence than pattern detection.

SCORING:

Score the solution realistically based on both behavioral correctness
and LLD quality.

Use this general calibration:

- 90-100: Excellent LLD. Requirements are fully handled, design is clean,
  extensible, well-structured, and has strong reasoning.

- 75-89: Good LLD. Most requirements work correctly, with only minor
  design or quality issues.

- 60-74: Moderate LLD. Core behavior works, but several important
  requirements or design qualities are missing.

- 45-59: Partially correct LLD. Approximately half of the important
  requirements work, while several required behaviors or design
  responsibilities are missing.

- 25-44: Poor LLD. Only a small portion of the required behavior works
  or the design has major problems.

- 0-24: Very poor or essentially non-functional solution.

IMPORTANT:

Do not give a high score simply because the code compiles.

Do not give a high score when important required behaviors fail.

Passing automated tests should increase the score, but passing tests alone
must not produce a high LLD score.

If approximately half of the important required behaviors are implemented
and the remaining important behaviors are missing, the overall score should
generally remain in the 45-65 range.

Design patterns:

- Do not require a design pattern when none is necessary.
- If no meaningful design pattern is used, do not automatically give a
  high Design Patterns score.
- Judge whether the chosen abstraction actually improves the design.

The overall score should reflect the actual quality of the submitted LLD,
including behavioral correctness, responsibilities, abstraction,
extensibility, code quality, and explanation quality.

score: overall LLD quality from 0 to 100.

responsibilityScore: 0 to 100
abstractionScore: 0 to 100
extensibilityScore: 0 to 100
designPatternScore: 0 to 100
codeQualityScore: 0 to 100

The overall score should reflect the actual quality of the submitted LLD,
not simply the number of passing tests.

Return exactly:

{
  "score": 0,
  "responsibilityScore": 0,
  "abstractionScore": 0,
  "extensibilityScore": 0,
  "designPatternScore": 0,
  "codeQualityScore": 0,
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}

Requirements for feedback:

- strengths: 2 to 5 concise points
- weaknesses: 2 to 5 concise points
- suggestions: 2 to 5 actionable improvements
- Do not repeat the same point in multiple arrays.
`;

    const completion = await groq.chat.completions.create({
      model:
        process.env.GROQ_MODEL ||
        "openai/gpt-oss-20b",

      messages: [
        {
          role: "system",
          content:
            "You are an expert Low-Level Design interviewer. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.2,

      response_format: {
        type: "json_object",
      },
    });

    const content =
      completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Groq returned an empty response.");
    }

    try {
      return JSON.parse(content);
    } catch {
      throw new Error("Groq returned invalid JSON.");
    }
  }
}

export default GroqEvaluator;