AI Usage — LLD Practice Platform

AI tools were used during development as a design, debugging, and reasoning aid. Final architecture and implementation decisions were reviewed and adapted to fit the assignment scope, the existing codebase, and the two-day MVP constraint.

1. Evaluation Architecture — Deterministic Checks + LLM Evaluation

AI suggestion: Separate evaluation into two layers — deterministic checks for things that can be objectively verified, and LLM evaluation for qualitative LLD qualities that don't reduce to pass/fail rules.

Decision: Accepted. The implemented pipeline is:

Submission → Validation → Compilation → Behavioral Tests → Edge-Case Detection → Layer 1 Decision → Groq AI Evaluation

Compilation and behavioral correctness are handled deterministically; the LLM evaluates responsibilities, abstraction, extensibility, design-pattern suitability, code quality, and explanation quality.

Why: An LLM shouldn't be the source of truth for behavior that can be directly tested — but tests alone can't judge whether a design has good responsibilities, abstractions, or extensibility.

2. Evaluator Abstraction

AI suggestion: Separate the AI provider from the rest of the evaluation workflow behind an evaluator abstraction.

Decision: Accepted and implemented.

js
class Evaluator {
  async evaluate(context) {
    throw new Error("evaluate() must be implemented");
  }
}

GroqEvaluator provides the current implementation (Evaluator ↑ GroqEvaluator).

Why: The evaluation workflow shouldn't depend directly on one AI provider — a different evaluator can implement the same evaluate() contract later without rewriting the submission workflow. This directly addresses the assignment's requirement about supporting another evaluation approach in the future.

3. Handling Multiple Valid LLD Solutions

AI suggestion: LLD problems shouldn't be evaluated against one exact reference implementation, since multiple designs can satisfy the same requirements.

Decision: Accepted. The evaluator judges submissions against required behavior, responsibilities, abstraction, extensibility, design-pattern suitability, code quality, explanation, and edge-case reasoning. The AI prompt explicitly states that multiple valid designs can exist and shouldn't be penalized for being structurally different from another solution.

Validation: Different Parking Lot implementations (HashSet-based and ArrayList-based) were tested during development, scoring 82 and 80 respectively — both received high evaluations rather than being rejected for using different implementations.

Why: The goal is to evaluate the learner's design quality, not whether they reproduced a predefined solution.

4. Structured AI Feedback

AI suggestion: Request structured output from the model instead of free-form feedback.

Decision: Accepted. GroqEvaluator requests structured JSON containing overall score, responsibility/abstraction/extensibility/design-pattern/code-quality scores, strengths, weaknesses, and suggestions.

Why: Structured output makes evaluation predictable for the backend and lets the frontend render feedback consistently — more useful than a single block of generated text.

5. Prompt Refinement and Evaluation Calibration

AI-assisted work: AI was used to refine the evaluation prompt and reason about scoring behavior for partial and differently-valid implementations. Key rules added to the prompt: don't require one canonical LLD design; don't reward a design just for using a named pattern, or penalize it for not using one when unnecessary; treat automated test results as real behavioral evidence; don't claim a passing test indicates missing behavior; compare the written explanation against the actual implementation; give specific, actionable feedback over generic praise; use score ranges consistently.

Decision: Accepted after reviewing generated evaluations. During testing, scoring guidance was tightened because partial implementations were scoring too generously. Calibration was adjusted to:

90–100 → Excellent
75–89 → Good
60–74 → Moderate
45–59 → Partially correct
25–44 → Poor
0–24 → Very poor

Why: An AI evaluator can otherwise produce inconsistent scores even when implementations differ obviously in quality. Explicit criteria and calibration make feedback more useful.

AI Suggestions We Rejected or Limited
Microservices / distributed architecture — the assignment explicitly allows a monolith and focuses on LLD, so we kept a simple React + Express + PostgreSQL monolith. No message queues, Kubernetes, or distributed infrastructure — they'd add complexity without improving the core MVP.
Complex asynchronous evaluation — a background-worker architecture could handle slower AI evaluation in production, but wasn't added to the MVP. Evaluation stays synchronous, with failures handled explicitly.
Over-engineering the domain — the project intentionally avoids extra repository/service/factory/infrastructure layers added just to demonstrate patterns. Abstractions (notably the Evaluator abstraction) were added only where they solve an actual problem.
Summary

AI was used as a development and design assistant, not as an unquestioned source of implementation decisions. The most meaningful AI-assisted decisions were:

Separating deterministic evaluation from LLM-based design evaluation.
Introducing the Evaluator abstraction to keep the AI provider replaceable.
Designing evaluation around multiple valid LLD solutions rather than one canonical implementation.
Using structured JSON for consistent AI feedback.
Refining the evaluation prompt and scoring calibration based on observed test results.

The final implementation was checked against the assignment requirements and simplified wherever an AI suggestion would have added unnecessary complexity. This document deliberately avoids claims like "AI generated the whole project," "AI wrote all the code," or "AI implemented another evaluator" because those would not accurately describe the development process.