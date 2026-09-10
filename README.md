# LLD Practice Platform

A focused Low-Level Design practice platform where learners can solve LLD problems, submit their solutions, and receive automated and AI-powered feedback.

**Practice loop:** Choose → Practice → Submit → Evaluate → Review → Retry

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [How to Run](#how-to-run)
- [Architecture](#architecture)
- [Design Decisions](#design-decisions)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)
- [Testing](#testing)
- [AI Usage](#ai-usage)
- [Project Structure](#project-structure)
- [Assignment Scope](#assignment-scope)

---

## Features

- Select from a small set of LLD problems:
  - Parking Lot
  - Elevator System
  - Vending Machine
- Database-driven problem descriptions, requirements, constraints, and starter code
- Monaco Editor for Java code practice
- Java compilation validation
- Automated behavioral test execution
- Static edge-case detection
- Groq-powered AI evaluation
- LLD feedback across design dimensions
- Strengths, weaknesses, and actionable suggestions
- Attempt history with previous scores and feedback
- Retry failed attempts
- Multiple valid implementations can be evaluated without requiring one specific design

---

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Bootstrap
- Monaco Editor

### Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- Groq SDK

---

## How to Run

### Prerequisites

Install the following:

- Node.js
- PostgreSQL
- Java JDK

Verify the installs:

```bash
node -v
java -version
javac -version
```

### Backend Setup

From the project root:

```bash
cd apps/Backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside `apps/Backend`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/lld_platform"
GROQ_API_KEY="YOUR_GROQ_API_KEY"
GROQ_MODEL="openai/gpt-oss-20b"
PORT=5000
```

Make sure PostgreSQL is running and the `lld_platform` database exists.

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate the Prisma client:

```bash
npx prisma generate
```

Seed the LLD problems:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

### Frontend Setup

Open another terminal from the project root:

```bash
cd apps/frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend normally runs at: `http://localhost:5173`

---

## Architecture

The application uses a simple monolithic architecture.

```
                    Frontend
                 React + Vite
                       |
                       v
                  Express API
                       |
                 Prisma ORM
                       |
                       v
                  PostgreSQL


              Evaluation Pipeline

              Student Submission
                       |
                       v
              Automated Validation
                       |
                       v
                Java Compilation
                       |
                       v
              Behavioral Test Runner
                       |
                       v
              Edge-Case Detection
                       |
                       v
                 Groq AI Evaluator
                       |
                       v
               Stored Evaluation
                       |
                       v
                  Feedback UI
```

The deterministic evaluation layer runs before the AI evaluator. If the solution fails the required automated checks, AI evaluation is skipped.

---

## Design Decisions

### 1. Two Evaluation Layers

The platform separates objective behavioral validation from qualitative LLD evaluation.

The deterministic layer handles:

- Submission validation
- Code size checks
- Java compilation
- Automated behavioral tests
- Edge-case detection

The AI layer handles reasoning about:

- Responsibility separation
- Abstraction
- Extensibility
- Design patterns
- Code quality
- Explanation quality
- Design trade-offs

This prevents the LLM from being the only source of truth for objectively testable behavior.

### 2. Code + Explanation Submission

The MVP asks learners to provide:

- Java code
- A written explanation of the design

The code provides evidence of the implementation, while the explanation captures the learner's reasoning, trade-offs, responsibilities, and design decisions.

A diagram was intentionally excluded from the MVP to keep the practice flow focused and achievable within the assignment scope.

### 3. Monolithic Architecture

A simple monolith was chosen because the assignment focuses on LLD practice rather than distributed systems.

The current architecture keeps the frontend, API, database access, and evaluation workflow straightforward and easy to run locally.

No unnecessary microservices, queues, Kubernetes, or distributed infrastructure are required for the MVP.

### 4. Database-Driven Problems

Problem data is stored in PostgreSQL instead of being hardcoded into the frontend.

Each problem can contain:

- Description
- Requirements
- Constraints
- Expected behavior
- Starter code
- Evaluation rules
- Test cases
- Execution contract

This allows additional LLD problems to be added through the database without changing the frontend practice flow.

### 5. Evaluator Abstraction

AI evaluation is separated behind an evaluator abstraction:

```javascript
class Evaluator {
  async evaluate(data) {
    throw new Error("evaluate() must be implemented");
  }
}
```

The current implementation is:

```
Evaluator
    |
    └── GroqEvaluator
```

This creates a seam for adding another evaluation strategy in the future without coupling the controller directly to Groq-specific implementation details.

---

## Limitations

### Authentication

The current MVP uses a hardcoded test user rather than a complete authentication system.

Real user registration, login, and authorization are outside the current MVP scope.

### Java Execution Security

Submitted Java code is compiled and executed by the backend and is not currently sandboxed.

This is a significant security limitation and would need to be addressed before exposing arbitrary code execution to untrusted users.

### Synchronous Evaluation

The evaluation request currently waits for compilation, testing, edge-case detection, and the Groq response.

A production implementation could move longer-running evaluation into background jobs.

### Edge-Case Detection

The static edge-case detector identifies code-pattern signals.

It can produce false positives or false negatives and therefore is treated as supporting evidence rather than definitive correctness.

### Problem Set

The MVP currently contains three LLD problems:

- Parking Lot
- Elevator System
- Vending Machine

### Language Support

Java is currently the supported submission language.

---

## Future Improvements

Possible future improvements include:

- Real user authentication
- Secure sandboxed code execution
- Background evaluation jobs
- More LLD problems
- Additional programming languages
- Richer static analysis
- Human evaluation support
- Comparison of designs across attempts
- More detailed learner analytics

---

## Testing

The project includes a separate test suite covering important platform behavior and failure cases.

The problem definitions also contain behavioral test cases used when evaluating submitted Java solutions.

The evaluation flow has been tested with:

- Completely incorrect solutions
- Partially correct solutions
- Strong solutions
- Multiple valid implementations of the same problem
- Compilation failures
- Automated test failures
- Edge cases
- AI evaluation failures

Two structurally different Parking Lot implementations were also tested to verify that the evaluator does not require a single reference implementation.

---

## AI Usage

AI tools were used during development for meaningful engineering tasks including implementation decisions, debugging, evaluation-prompt design, and refinement of the evaluation workflow.

See `AI_USAGE.md` for details on the AI-assisted development decisions and how they influenced the implementation.

---

## Project Structure

```
cipherSchool/
│
├── apps/
│   ├── frontend/
│   │   ├── public/
│   │   │   ├── components/
│   │   │   └── pages/
│   │   └── src/
│   │       ├── components/
│   │       ├── pages/
│   │       ├── services/
│   │       ├── App.jsx
│   │       └── main.jsx
│   │
│   └── Backend/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.js
│       └── src/
│           ├── controllers/
│           ├── evaluators/
│           │   ├── Evaluator.js
│           │   └── GroqEvaluator.js
│           ├── routes/
│           ├── utils/
│           ├── lib/
│           └── server.js
│
├── README.md
├── RESEARCH.md
├── DESIGN.md
└── AI_USAGE.md
```

---

## Assignment Scope

This project focuses specifically on practicing Low-Level Design through:

- Classes
- Objects
- Responsibilities
- Abstractions
- Interfaces
- Behavior
- Extensibility
- Design patterns
- Code-level trade-offs