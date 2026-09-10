import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { startAttempt } from "../services/api";
import { retryAttempt } from "../services/api";


const Feedback = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleRetry = async () => {
  try {
    await retryAttempt(
      evaluation.submission.attempt.id
    );

    toast.success("Attempt reset. Try again!");

    navigate(
      `/practice/${evaluation.submission.attempt.id}`
    );
  } catch (error) {
    toast.error(
      error.message || "Failed to retry"
    );
    }
  };


  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/evaluations/${submissionId}`
        );

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.message || "Failed to load feedback");
          return;
        }

        setEvaluation(data.evaluation);
      } catch (error) {
        console.error(error);
        toast.error("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="feedback-page">
        <div className="feedback-loading">
          <div className="loading-spinner"></div>
          <p>Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="feedback-page">
        <div className="feedback-empty">
          <h2>Feedback not found</h2>
          <button
            className="feedback-back-button"
            onClick={() => navigate("/problems")}
          >
            Back to Problems
          </button>
        </div>
      </div>
    );
  }

  const strengths =
    evaluation.strengths?.split("\n").filter(Boolean) || [];

  const weaknesses =
    evaluation.weaknesses?.split("\n").filter(Boolean) || [];

  const suggestions =
    evaluation.suggestions?.split("\n").filter(Boolean) || [];

  const handleTryAgain = async () => {
    try {
      const problemId = evaluation.submission.attempt.problem.id;

      const data = await startAttempt(problemId);

      navigate(`/practice/${data.attempt.id}`);
    } catch (error) {
      toast.error(error.message || "Failed to start new attempt");
    }
  };

  const score = evaluation.score ?? 0;

  return (
    <div className="feedback-page">
      <div className="feedback-container">

        <div className="feedback-header">
          <span className="feedback-badge">
            AI EVALUATION
          </span>

          <h1>Design Feedback</h1>

          <p>
            Review your solution, understand your strengths,
            and identify areas where your LLD design can improve.
          </p>
        </div>

        <div className="feedback-problem">
          <div>
            <span className="feedback-label">
              PROBLEM
            </span>

            <h2>
              {evaluation.submission.attempt.problem.title}
            </h2>
          </div>

          <div className="feedback-problem-meta">
            <span>
              Attempt #
              {evaluation.submission.attempt.attemptNumber}
            </span>

            <span>•</span>

            <span>
              {evaluation.aiModel || "AI Evaluation"}
            </span>
          </div>
        </div>

        <div className="feedback-score-card">

          <div className="score-content">
            <span className="score-label">
              OVERALL SCORE
            </span>

            <div className="score-value">
              {score}
              <span>/100</span>
            </div>

            <p>
              Your overall LLD design quality score
            </p>
          </div>

          <div className="score-ring">
            <svg viewBox="0 0 120 120">
              <circle
                className="score-ring-bg"
                cx="60"
                cy="60"
                r="50"
              />

              <circle
                className="score-ring-progress"
                cx="60"
                cy="60"
                r="50"
                strokeDasharray={`${score * 3.14} 314`}
              />
            </svg>

            <span>{score}%</span>
          </div>

        </div>

        <section className="feedback-section">

          <div className="feedback-section-header">
            <span className="feedback-section-number">
              01
            </span>

            <div>
              <h2>Design Evaluation</h2>
              <p>
                How your solution performed across important
                LLD design dimensions.
              </p>
            </div>
          </div>

          <div className="evaluation-grid">

            <div className="evaluation-card">
              <div className="evaluation-card-top">
                <span>Responsibilities</span>
                <strong>
                  {evaluation.responsibilityScore ?? 0}
                  <small>/100</small>
                </strong>
              </div>

              <div className="progress-bar">
                <div
                  style={{
                    width: `${evaluation.responsibilityScore ?? 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="evaluation-card">
              <div className="evaluation-card-top">
                <span>Abstraction</span>
                <strong>
                  {evaluation.abstractionScore ?? 0}
                  <small>/100</small>
                </strong>
              </div>

              <div className="progress-bar">
                <div
                  style={{
                    width: `${evaluation.abstractionScore ?? 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="evaluation-card">
              <div className="evaluation-card-top">
                <span>Extensibility</span>
                <strong>
                  {evaluation.extensibilityScore ?? 0}
                  <small>/100</small>
                </strong>
              </div>

              <div className="progress-bar">
                <div
                  style={{
                    width: `${evaluation.extensibilityScore ?? 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="evaluation-card">
              <div className="evaluation-card-top">
                <span>Design Patterns</span>
                <strong>
                  {evaluation.designPatternScore ?? 0}
                  <small>/100</small>
                </strong>
              </div>

              <div className="progress-bar">
                <div
                  style={{
                    width: `${evaluation.designPatternScore ?? 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="evaluation-card">
              <div className="evaluation-card-top">
                <span>Code Quality</span>
                <strong>
                  {evaluation.codeQualityScore ?? 0}
                  <small>/100</small>
                </strong>
              </div>

              <div className="progress-bar">
                <div
                  style={{
                    width: `${evaluation.codeQualityScore ?? 0}%`,
                  }}
                ></div>
              </div>
            </div>

          </div>
        </section>

        <div className="feedback-columns">

          <section className="feedback-box strengths-box">
            <div className="feedback-box-header">
              <div className="feedback-icon strength-icon">
                ✓
              </div>

              <div>
                <h2>Strengths</h2>
                <p>What you did well</p>
              </div>
            </div>

            <ul>
              {strengths.length > 0 ? (
                strengths.map((strength, index) => (
                  <li key={index}>
                    <span>✓</span>
                    {strength}
                  </li>
                ))
              ) : (
                <li>
                  <span>✓</span>
                  No specific strengths were provided.
                </li>
              )}
            </ul>
          </section>

          <section className="feedback-box weaknesses-box">
            <div className="feedback-box-header">
              <div className="feedback-icon weakness-icon">
                !
              </div>

              <div>
                <h2>Areas to Improve</h2>
                <p>Where your design can improve</p>
              </div>
            </div>

            <ul>
              {weaknesses.length > 0 ? (
                weaknesses.map((weakness, index) => (
                  <li key={index}>
                    <span>!</span>
                    {weakness}
                  </li>
                ))
              ) : (
                <li>
                  <span>!</span>
                  No major weaknesses were identified.
                </li>
              )}
            </ul>
          </section>

        </div>

        <section className="feedback-box suggestions-box">

          <div className="feedback-box-header">
            <div className="feedback-icon suggestion-icon">
              →
            </div>

            <div>
              <h2>How to Improve</h2>
              <p>Actionable suggestions for your next attempt</p>
            </div>
          </div>

          <div className="suggestions-list">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  className="suggestion-item"
                  key={index}
                >
                  <span>{index + 1}</span>
                  <p>{suggestion}</p>
                </div>
              ))
            ) : (
              <div className="suggestion-item">
                <span>1</span>
                <p>
                  Try another attempt and focus on improving
                  your design decisions.
                </p>
              </div>
            )}
          </div>

        </section>

        <div className="feedback-actions">
          <button
            className="try-again-button"
            onClick={handleRetry}
          >
            Try Again
            <span>→</span>
          </button>

          <button
            className="secondary-feedback-button"
            onClick={() => navigate("/feedback")}
          >
            View History
          </button>

          <button
            className="secondary-feedback-button"
            onClick={() => navigate("/problems")}
          >
            Back to Problems
          </button>
        </div>

      </div>
    </div>
  );
};

export default Feedback;