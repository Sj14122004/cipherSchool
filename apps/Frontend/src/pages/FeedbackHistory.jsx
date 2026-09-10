import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAttemptHistory } from "../services/api";
import { toast } from "sonner";

const FeedbackHistory = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getAttemptHistory();

        const completedAttempts = data.attempts.filter(
          (attempt) => attempt.submission?.evaluation
        );

        setAttempts(completedAttempts);
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Failed to load feedback history");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const getScoreClass = (score) => {
    if (score >= 80) return "score-good";
    if (score >= 60) return "score-average";
    return "score-low";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const averageScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce(
            (total, attempt) =>
              total + (attempt.submission?.evaluation?.score || 0),
            0
          ) / attempts.length
        )
      : 0;

  const bestScore =
    attempts.length > 0
      ? Math.max(
          ...attempts.map(
            (attempt) => attempt.submission?.evaluation?.score || 0
          )
        )
      : 0;

  const problemsPracticed = new Set(
    attempts.map((attempt) => attempt.problem.id)
  ).size;

  if (loading) {
    return (
      <div className="history-page">
        <div className="history-loading">
          <div className="history-spinner"></div>
          <p>Loading your feedback history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-container">

        <div className="history-header">
          <span className="history-badge">
            PRACTICE HISTORY
          </span>

          <h1>Your Feedback History</h1>

          <p>
            Review your previous LLD attempts and track how
            your design skills improve over time.
          </p>
        </div>

        {attempts.length > 0 && (
          <div className="history-stats">

            <div className="history-stat-card">
              <span className="stat-label">
                AVERAGE SCORE
              </span>

              <strong>{averageScore}</strong>

              <span className="stat-description">
                Across all attempts
              </span>
            </div>

            <div className="history-stat-card">
              <span className="stat-label">
                BEST SCORE
              </span>

              <strong>{bestScore}</strong>

              <span className="stat-description">
                Personal best
              </span>
            </div>

            <div className="history-stat-card">
              <span className="stat-label">
                PROBLEMS
              </span>

              <strong>{problemsPracticed}</strong>

              <span className="stat-description">
                Problems practiced
              </span>
            </div>

          </div>
        )}

        <div className="history-list-header">
          <div>
            <h2>Previous Attempts</h2>
            <p>
              Your completed LLD evaluations
            </p>
          </div>

          <button
            className="practice-more-button"
            onClick={() => navigate("/problems")}
          >
            Practice More
            <span>→</span>
          </button>
        </div>

        {attempts.length === 0 ? (
          <div className="history-empty">
            <div className="empty-icon">
              ◇
            </div>

            <h2>No feedback yet</h2>

            <p>
              Complete your first LLD problem to see your
              evaluation and feedback here.
            </p>

            <button
              className="start-first-button"
              onClick={() => navigate("/problems")}
            >
              Start Practicing
              <span>→</span>
            </button>
          </div>
        ) : (
          <div className="history-list">

            {attempts.map((attempt) => {
              const evaluation = attempt.submission?.evaluation;

              const score = evaluation?.score ?? 0;

              return (
                <div
                  className="history-attempt-card"
                  key={attempt.id}
                >

                  <div className="attempt-main">

                    <div className="attempt-number">
                      <span>
                        #{attempt.attemptNumber}
                      </span>
                    </div>

                    <div className="attempt-info">

                      <div className="attempt-title-row">
                        <h3>
                          {attempt.problem.title}
                        </h3>

                        <span
                          className={`history-difficulty difficulty-${attempt.problem.difficulty.toLowerCase()}`}
                        >
                          {attempt.problem.difficulty}
                        </span>
                      </div>

                      <div className="attempt-meta">
                        <span>
                          {attempt.problem.category}
                        </span>

                        <span>•</span>

                        <span>
                          {formatDate(attempt.createdAt)}
                        </span>

                        <span>•</span>

                        <span className="completed-status">
                          Completed
                        </span>
                      </div>

                    </div>

                  </div>

                  <div className="attempt-score">
                    <span className="score-label-small">
                      SCORE
                    </span>

                    <strong
                      className={getScoreClass(score)}
                    >
                      {score}
                    </strong>

                    <span className="score-out-of">
                      /100
                    </span>
                  </div>

                  <button
                    className="view-feedback-button"
                    onClick={() =>
                      navigate(
                        `/feedback/${attempt.submission.id}`
                      )
                    }
                  >
                    View Feedback
                    <span>→</span>
                  </button>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
};

export default FeedbackHistory;