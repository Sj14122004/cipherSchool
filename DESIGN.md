Design Note — LLD Practice Platform
1. System Overview

A focused monolithic application: a learner selects an LLD problem, starts an attempt, writes a solution, submits it, receives automated + AI-based feedback, reviews past attempts, and retries. Kept simple because the assignment focuses on LLD/domain design, not large-scale HLD.

Flow: Choose Problem → Start Attempt → Write Code + Explanation → Submit → Automated Evaluation → AI Evaluation (if applicable) → Store Evaluation → View Feedback → Retry / View History.

Frontend owns the learner experience; backend owns the workflow, persistence, compilation, behavioral evaluation, and AI evaluation.

2. Database Schema

User — learner identity (id, name, email, password). Auth is simplified (seeded test user) for the MVP.

Problem — an LLD problem, with requirements, constraints, starterCode, executionContract, testCases, evaluationRules stored on the problem so the same workflow can be reused across problems without per-problem controller logic.

Attempt — one practice attempt per (user, problem, attemptNumber), enforced by @@unique([userId, problemId, attemptNumber]). States: IN_PROGRESS → SUBMITTED → EVALUATING → COMPLETED | FAILED.

Submission — the learner's code + explanation. attemptId is unique, so an attempt has at most one active submission; on retry, the previous submission/evaluation are deleted and the attempt is reset to IN_PROGRESS. Explanation matters because LLD evaluation judges responsibilities/abstractions/design reasoning, not just executable behavior.

Evaluation — one per submission (submissionId unique). Stores per-dimension scores (responsibility, abstraction, extensibility, design pattern, code quality) rather than a single score, so feedback is actionable.

Why JSON fields: evaluationRules, testCases, executionContract vary in shape per problem (e.g. { className, methodName, parameterType, returnType }), so JSON avoids extra tables for problem-specific structure.

3. API Design

REST, since the MVP has a small, straightforward set of resource/workflow operations.

GET /api/problems, GET /api/problems/:id
POST /api/attempts (start), GET /api/attempts/:id, GET /api/attempts/history, POST /api/attempts/:id/retry
POST /api/submissions (code + explanation; validates presence and max size)
POST /api/evaluations (runs automated checks, then AI evaluator if allowed), GET /api/evaluations/:submissionId
4. Evaluator Design
class Evaluator {
  async evaluate(context) {
    throw new Error("evaluate() must be implemented");
  }
}

GroqEvaluator is the current concrete implementation (Evaluator ↑ GroqEvaluator). It receives problem requirements, submitted code, explanation, test results, and edge-case signals, and returns scores + strengths/weaknesses/suggestions. It's told multiple valid LLD designs can exist.

Why it matters: the workflow depends on the Evaluator contract, not on Groq directly — a future evaluator (another AI provider, or a human-review mechanism) could implement the same evaluate() contract without rewriting the submission workflow. These are future extension points, not implemented today.

5. Evaluation Pipeline
Validation — code/explanation present, size limit, attempt exists.
Static analysis — line/class/method counts, placeholder detection, naming/size signals (automated signals, not full design evaluation).
Java compilation — temp dir, javac, timeout, cleanup. Compilation failure → AI evaluation skipped.
Behavioral tests — the problem's execution contract drives a generated test harness; result is PASS / PARTIAL / FAIL.
Edge-case detection — static signals only (null checks, boundaries, duplicates, etc.); a detected signal is not proof of correct handling.
Layer 1 decision — automated layer yields FAIL / PASS / WARNING. On FAIL: Groq is skipped, a FAILED Evaluation is persisted, Attempt → FAILED (so the learner still gets deterministic feedback).
AI evaluation — runs when Layer 1 passes/warns; judges responsibility separation, abstraction, extensibility, pattern suitability, code quality, explanation quality, requirements coverage, edge-case reasoning — with automated test results passed in as objective evidence.
Persist — successful path: Submission → EVALUATED, Attempt → COMPLETED.
6. Design Patterns & Principles
Evaluator abstraction / polymorphic evaluation strategy — workflow depends on the Evaluator contract, not on Groq directly.
Separation of responsibilities — Controllers (workflow) / compilation module / test runner / edge-case detector / Evaluator (qualitative judgment) / Prisma (persistence) are distinct modules/functions (compileJava, runJavaTests, detectEdgeCases), not a single controller doing everything.
7. Trade-offs
Decision	Chosen	Alternative	Reason
Architecture	Monolith	Microservices	Assignment focuses on LLD; microservices add needless ops complexity
Evaluation execution	Synchronous	Background jobs	Simpler for a 2-day MVP; avoids queues/workers
Evaluation method	Deterministic + AI	AI-only	Objective behavior verified deterministically, not just by LLM judgment
Code execution	Direct	Sandboxed	Simpler for MVP; documented security limitation
Language	Java only	Multiple	Keeps MVP focused, avoids multi-runtime integration
Submission	Code + Explanation	Diagram + Code	Explanation captures design reasoning code alone can't
Database	PostgreSQL + Prisma	NoSQL	Clear relational structure between user/problem/attempt/submission/evaluation
API	REST	GraphQL	Small, straightforward endpoint set
8. Extensibility
New problem — add via DB config (requirements, starter code, execution contract, test cases, evaluation rules); no controller changes needed.
New evaluator — implement Evaluator.evaluate(); rest of the workflow is unchanged.
New language — would need a language-specific compiler/runtime + test runner producing a normalized test result; not implemented today.
New submission format — the Attempt → Submission → Evaluation separation leaves room for this later; not implemented today.
9. Failure Handling
Invalid submission → 400 Bad Request.
Compilation failure → Submission INVALID, Evaluation FAILED, Attempt FAILED; AI evaluation skipped.
Automated (Layer 1) failure → Evaluation FAILED, Attempt FAILED, Groq skipped; automated results still returned to the client.
AI evaluation failure → Evaluation FAILED, Submission INVALID, Attempt FAILED; error stored so the attempt isn't left in an unknown state.
Evaluation states — schema includes PENDING/PROCESSING/COMPLETED/FAILED/RETRY_SCHEDULED even though execution is currently synchronous, leaving room for a future background evaluation job.
Retry — same attempt number is reused; the previous submission/evaluation are deleted and the attempt reset to IN_PROGRESS (deliberate MVP simplification, not multiple submissions per attempt).
10. Key Design Decisions

What must a learner provide for a meaningful attempt? Code + Explanation — code shows implementation/behavior, explanation captures design reasoning and trade-offs.

How is feedback useful when multiple valid LLD solutions exist? No single canonical implementation is required: deterministic checks verify required behavior, while the AI judges design quality/reasoning — so structurally different solutions can still be evaluated fairly.

What's deterministic vs. LLM-judged?

Deterministic: submission validation, compilation, behavioral tests, static edge-case signals.
LLM: responsibility separation, abstraction, extensibility, pattern suitability, code quality, explanation quality, design reasoning.

How could another evaluation approach be added? Implement the Evaluator.evaluate() contract; GroqEvaluator is just the current implementation.

What happens if evaluation is slow or fails? Kept synchronous to avoid distributed-system complexity for the MVP; compilation has a timeout, failures are caught and persisted, and failed attempts can be retried. Moving AI evaluation to a background job is a future improvement, intentionally out of scope now.

11. Scope Boundary

Focus is Low-Level Design: classes, objects, responsibilities, abstractions/interfaces, relationships, behavior, design patterns, extensibility, code-level decisions. Large-scale HLD concerns (Kubernetes, microservices, multi-region, sharding, CDN) and production hardening (sandboxed execution, background AI evaluation) are explicitly out of scope for the MVP and noted as future wor