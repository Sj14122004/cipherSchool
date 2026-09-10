import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";

import {
  getAttempt,
  submitSolution,
  evaluateSubmission,
} from "../services/api";

const Practice = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [code, setCode] = useState("");
  const [explanation, setExplanation] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const data = await getAttempt(attemptId);

        setAttempt(data.attempt);

        const starterCode = data.attempt.problem.starterCode;

        if (starterCode) {
          setCode(starterCode);
        } else {
          setCode("");
        }

        // Reset explanation when opening a different attempt
        setExplanation("");
        setError("");
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load practice");
      } finally {
        setLoading(false);
      }
    };

    fetchAttempt();
  }, [attemptId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error("Please write your solution.");
      return;
    }

    if (!explanation.trim()) {
      toast.error("Please explain your design.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const submissionData = await submitSolution({
        attemptId: Number(attemptId),
        language: "Java",
        code,
        explanation,
      });

      const submissionId = submissionData.submission.id;

      const evaluationData =
        await evaluateSubmission(submissionId);

      if (evaluationData.layer1Status === "FAIL") {
        toast.error("Solution failed automated tests.");

        navigate(`/feedback/${submissionId}`);

        return;
      }

      toast.success("Solution evaluated successfully!");

      navigate(`/feedback/${submissionId}`);
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to submit solution");

      toast.error(err.message || "Failed to submit solution");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="practice-page">
        <div className="practice-loading">
          <div className="loading-spinner"></div>
          <p>Loading practice...</p>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="practice-page">
        <div className="practice-error-page">
          <h2>Practice not found</h2>

          <button
            className="back-button"
            onClick={() => navigate("/problems")}
          >
            Back to Problems
          </button>
        </div>
      </div>
    );
  }

  const problem = attempt.problem;

  const requirements = problem.requirements
    ? problem.requirements
        .split(/\s*-\s+/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const commandFormat =
    problem.executionContract?.commandFormat;

  return (
    <div className="practice-page">
      <div className="practice-container">

        <div className="practice-header">
          <div className="practice-header-top">
            <span className="practice-badge">
              LLD PRACTICE
            </span>

            <span
              className={`difficulty difficulty-${problem.difficulty.toLowerCase()}`}
            >
              {problem.difficulty}
            </span>
          </div>

          <h1>{problem.title}</h1>

          <div className="practice-meta">
            <span>{problem.category}</span>

            {problem.estimatedTime && (
              <>
                <span className="meta-dot">•</span>
                <span>{problem.estimatedTime} min</span>
              </>
            )}

            <span className="meta-dot">•</span>

            <span>Attempt #{attempt.attemptNumber}</span>
          </div>
        </div>


        <div className="practice-layout">

          <div className="practice-card problem-card">

            {/* Problem */}

            <section className="problem-section first-section">
              <div className="section-label">
                <span className="section-icon">01</span>
                <h2>Problem</h2>
              </div>

              <p className="problem-description">
                {problem.description}
              </p>
            </section>

            {/* Requirements */}

            {requirements.length > 0 && (
              <section className="problem-section">
                <div className="section-label">
                  <span className="section-icon">02</span>
                  <h2>Requirements</h2>
                </div>

                <ul className="requirements-list">
                  {requirements.map(
                    (requirement, index) => (
                      <li key={index}>
                        <span className="requirement-check">
                          ✓
                        </span>

                        <span>{requirement}</span>
                      </li>
                    )
                  )}
                </ul>
              </section>
            )}

            {/* Constraints */}

            {problem.constraints && (
              <section className="problem-section">
                <div className="section-label">
                  <span className="section-icon">03</span>
                  <h2>Constraints</h2>
                </div>

                <div className="info-box">
                  <p>{problem.constraints}</p>
                </div>
              </section>
            )}

            {/* Expected Behavior */}

            {problem.expectedBehavior && (
              <section className="problem-section">
                <div className="section-label">
                  <span className="section-icon">04</span>
                  <h2>Expected Behavior</h2>
                </div>

                <div className="info-box behavior-box">
                  <p>{problem.expectedBehavior}</p>
                </div>
              </section>
            )}


            {commandFormat && (
              <section className="problem-section command-format-section">
                <div className="section-label">
                  <span className="section-icon">05</span>
                  <h2>Command Format</h2>
                </div>

                <div className="command-format-box">

                  <p className="command-format-description">
                    Your{" "}
                    <code>
                      {problem.executionContract?.methodName ||
                        "execute"}
                    </code>{" "}
                    method receives commands in the following
                    format:
                  </p>

                  {commandFormat.syntax?.length > 0 && (
                    <div className="command-block">
                      <div className="command-block-title">
                        Commands
                      </div>

                      <div className="command-list">
                        {commandFormat.syntax.map(
                          (command, index) => (
                            <code
                              key={index}
                              className="command-item"
                            >
                              {command}
                            </code>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {commandFormat.examples?.length > 0 && (
                    <div className="command-block">
                      <div className="command-block-title">
                        Examples
                      </div>

                      <div className="command-list">
                        {commandFormat.examples.map(
                          (example, index) => (
                            <code
                              key={index}
                              className="command-item"
                            >
                              {example}
                            </code>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <div className="command-note">
                    <span>💡</span>

                    <span>
                      Implement the{" "}
                      <code>execute(String command)</code>{" "}
                      method to handle these commands.
                    </span>
                  </div>

                </div>
              </section>
            )}


            <section className="practice-tip">
              <div className="tip-icon">
                💡
              </div>

              <div>
                <h3>Design Tip</h3>

                <p>
                  Focus on clear responsibilities,
                  relationships between classes,
                  extensibility, and the reasoning
                  behind your design decisions.
                </p>
              </div>
            </section>
          </div>


          <div className="practice-card solution-card">

            <div className="solution-header">
              <div>
                <span className="solution-label">
                  YOUR SUBMISSION
                </span>

                <h2>Design Your Solution</h2>

                <p>
                  Write your implementation and explain
                  your design decisions.
                </p>
              </div>

              <span className="language-badge">
                Java
              </span>
            </div>

            <form onSubmit={handleSubmit}>


              <div className="editor-group">

                <div className="editor-header">
                  <label htmlFor="code">
                    Java Code
                  </label>

                  <span>
                    {code.replace(/\s/g, "").length}{" "}
                    characters
                  </span>
                </div>

                <div className="code-wrapper">

                  <div className="code-top-bar">
                    <div className="window-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>

                    <span className="file-name">
                      Solution.java
                    </span>
                  </div>

                  <Editor
                    height="500px"
                    language="java"
                    theme="vs-dark"
                    value={code}
                    onChange={(value) =>
                      setCode(value || "")
                    }
                    options={{
                      fontSize: 14,

                      minimap: {
                        enabled: false,
                      },

                      automaticLayout: true,

                      tabSize: 4,

                      insertSpaces: true,

                      wordWrap: "off",

                      padding: {
                        top: 16,
                        bottom: 16,
                      },

                      scrollBeyondLastLine: false,

                      lineNumbers: "on",

                      folding: true,

                      bracketPairColorization: {
                        enabled: true,
                      },

                      autoIndent: "full",

                      formatOnPaste: true,

                      cursorBlinking: "smooth",

                      smoothScrolling: true,
                    }}
                  />

                </div>
              </div>


              <div className="editor-group explanation-group">

                <div className="editor-header">
                  <label htmlFor="explanation">
                    Explain Your Design
                  </label>

                  <span>
                    {explanation.replace(/\s/g, "").length}{" "}
                    characters
                  </span>
                </div>

                <textarea
                  id="explanation"
                  className="explanation-editor"
                  value={explanation}
                  onChange={(e) =>
                    setExplanation(e.target.value)
                  }
                  placeholder="Explain your classes, responsibilities, relationships, design patterns, extensibility, and important trade-offs..."
                />

              </div>


              {error && (
                <div className="practice-error">
                  <span>⚠</span>

                  <span>{error}</span>
                </div>
              )}


              <div className="submit-area">

                <div className="submit-info">
                  <span>
                    Ready to submit?
                  </span>

                  <small>
                    Your solution will be automatically
                    evaluated.
                  </small>
                </div>

                <button
                  className="submit-button"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="button-spinner"></span>
                      Evaluating...
                    </>
                  ) : (
                    <>
                      Submit Solution
                      <span className="arrow">
                        →
                      </span>
                    </>
                  )}
                </button>

              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;