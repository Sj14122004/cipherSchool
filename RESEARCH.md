# Research Note — LLD Practice Platform

## 1. Problem Space Research

**LLD practice problem**
Low-Level Design (LLD) is one of the hardest interview and engineering skills to practice independently. Unlike DSA, where correctness can be checked by running a solution against test cases, LLD quality is judged on responsibility separation, abstraction, extensibility, and trade-offs — qualities that don't have a single "correct" answer.

**Learner difficulties**
- No fast feedback loop: learners write a design, but rarely get told *why* it's weak.
- No safe space to practice: real interview practice (mock interviews) is high-pressure and low-frequency.
- Self-assessment is unreliable: learners often can't judge their own designs against dimensions like extensibility or SOLID adherence.
- Most available material is theoretical (articles, videos) rather than hands-on with feedback.

**Existing approaches**
- **LeetCode** — strong for DSA, weak/absent for LLD; no structured design feedback.
- **Educative** — good structured LLD courses, but one-directional (reading/video), not evaluative.
- **HackerRank** — has some design-adjacent problems but evaluation is still primarily output-based, not design-quality-based.
- **Pramp / Exponent** — peer or mentor-based mock interviews for LLD, but require scheduling, human availability, and are not scalable/on-demand.

**Gaps identified**
- No on-demand platform that evaluates *design quality*, not just functional correctness.
- No platform that combines deterministic checks (compiles, passes tests) with qualitative reasoning (is this a good design) in one feedback loop.
- No easy way to retry and see if design decisions actually improved based on structured feedback.

---

## 2. Evaluation Approach Research

**Why evaluation is needed**
Without feedback, practice doesn't translate into skill improvement. Learners need to know both *what* is wrong (a failing test, a compile error) and *why* their design is weak (poor abstraction, missing extensibility point).

**Deterministic evaluation**
Handles what can be objectively verified: does the code compile, does it pass behavioral tests, do static edge-case checks catch missing handling. This layer is fast, consistent, and repeatable.

**LLM evaluation**
Handles what can't be reduced to a pass/fail test: responsibility separation, abstraction quality, extensibility, pattern usage, and the clarity of the learner's written explanation.

**Why a two-layer approach**
Relying on an LLM alone risks inconsistent or hallucinated scoring on objectively checkable behavior (e.g., the AI might reward code that doesn't even compile). Relying on tests alone can't assess design quality — a poorly designed class can still pass all behavioral tests. Separating the layers means the AI only reasons about what genuinely requires judgment, after objective correctness is already confirmed.

**Handling multiple valid solutions**
LLD problems intentionally have more than one acceptable design. The evaluation approach avoids matching against a single reference implementation; instead, both deterministic tests and the AI evaluator are designed to validate behavior and design principles generically, so structurally different valid solutions (e.g., two different Parking Lot class designs) can both score well.

---

## 3. Problem Selection Research

**Parking Lot, Elevator, Vending Machine**
These three are among the most frequently asked LLD interview problems across companies, which makes them a practical, high-relevance starting set for learners.

**Characteristics of a good LLD problem (for this platform)**
- Supports multiple valid designs, not one canonical answer.
- Has clear extensibility points (e.g., new vehicle types, new elevator scheduling strategies) that reveal whether a design anticipates change.
- Has behavior that's testable through deterministic checks (state transitions, capacity limits, dispensing logic).
- Is scoped small enough to complete in a single practice session, but rich enough to expose design trade-offs.

---

## 4. Tech Stack Decisions

- **Monaco Editor** — same editor engine as VS Code, so the coding experience feels familiar to most developers with minimal onboarding friction.
- **React + Vite** — fast dev server and HMR, well-suited for an iterative UI like an editor + feedback panel.
- **Express** — lightweight, well-understood, sufficient for a monolithic API without unnecessary framework overhead.
- **Prisma + PostgreSQL** — problem data (requirements, constraints, test cases, evaluation rules) is inherently structured and relational, which fits a relational database better than a document store; Prisma gives type-safe schema access without hand-written SQL.
- **Java as first supported language** — most common language for LLD interviews, and has mature compilation/execution tooling that's straightforward to shell out to from Node.
- **Groq for AI evaluation** — chosen for low-latency inference, which matters since evaluation is currently synchronous and the learner is waiting on the response.

---

## 5. Execution and Security Research

**Why executing submitted code is risky**
Compiling and running arbitrary user-submitted code on the same backend process/host is a classic remote code execution risk — a malicious submission could access the filesystem, network, or other resources available to the backend process.

**Options considered**
- **Docker** — isolate each submission in a short-lived container; strong isolation, but adds infra overhead (image management, container lifecycle) for an MVP.
- **Judge0** — an existing open-source code execution API with built-in sandboxing; would offload the sandboxing problem entirely but adds an external dependency.
- **Piston** — similar hosted/self-hosted execution engine, lighter weight than Judge0 for simple cases.
- **gVisor** — kernel-level sandboxing for containers; more security-hardened than plain Docker, but adds operational complexity.

**What we implemented vs. what we left out**
For the MVP, code is compiled and executed directly on the backend without sandboxing, which is called out explicitly as a limitation in the README. Sandboxing (most likely via Docker or Judge0) is flagged as a required step before this platform could be exposed to untrusted, public users.

---

## 6. AI Evaluation Research

**Evaluation dimensions**
The AI evaluator scores along consistent LLD dimensions: responsibility separation, abstraction, extensibility, design pattern usage, code quality, and explanation quality — so feedback is comparable across different problems and submissions.

**Structured JSON output**
The evaluator prompts Groq to return a structured JSON response (scores, strengths, weaknesses, suggestions) rather than free-form text, so the frontend can render consistent, parseable feedback instead of needing to reformat prose.

**Prompt design**
Prompts were iterated to reduce vague or generic feedback (e.g., "good job") and push toward specific, actionable critique tied to the actual submitted code and explanation.

**Multiple valid solutions**
The prompt explicitly avoids anchoring the AI to one reference design, instead asking it to reason about whether the submitted design satisfies the stated requirements and constraints on its own merits.

**Avoiding pattern-based scoring**
Care was taken so the evaluator doesn't simply reward the presence of named design patterns (Factory, Strategy, etc.) regardless of fit — pattern usage is only scored positively when it's actually appropriate to the problem, not just present.

**Using automated test results as evidence**
Results from the deterministic layer (compilation success, test pass/fail, edge-case flags) are passed into the AI evaluation prompt as supporting evidence, so the AI's qualitative judgment is grounded in objective signals rather than reasoning about the code in isolation.

---

## 7. Product Direction

**What we decided to build**
A focused, single-loop LLD practice platform: pick a problem, write code + explanation, submit, get layered feedback, retry.

**Practice flow**
Choose → Practice → Submit → Evaluate → Review → Retry — a tight loop designed to be repeatable in a single sitting, rather than a multi-day project.

**Why Code + Explanation**
Code alone shows *what* was built but not *why*. Requiring a written explanation captures the learner's reasoning, trade-offs, and intended responsibilities — which the AI evaluator can then assess alongside the code itself, closer to how a real interviewer probes design decisions.

**Why simple monolith**
The assignment's focus is LLD practice, not distributed systems design. A monolith keeps the frontend, API, database access, and evaluation pipeline easy to run locally and reason about, without introducing microservices, queues, or orchestration complexity that the MVP doesn't need.