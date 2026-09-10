import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Problem = () => {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProblems = async () => {
    const response = await fetch("http://localhost:5000/api/problems");
    const data = await response.json();

    setProblems(data.problems);
    setLoading(false);
  };

  const startPractice = async (problemId) => {
    const response = await fetch(
      "http://localhost:5000/api/attempts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemId,
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      navigate(`/practice/${data.attempt.id}`);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  if (loading) {
    return (
      <div className="problems-page">
        <div className="problems-container">
          <p className="loading-text">Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="problems-page">
      <div className="problems-container">

        <div className="problems-header">
          <span className="problems-badge">
            PRACTICE ARENA
          </span>

          <h1>Choose Your LLD Challenge</h1>

          <p>
            Practice real-world Low-Level Design problems and
            get AI-powered feedback on your solution.
          </p>
        </div>

        <div className="problem-grid">
          {problems.map((problem) => (
            <div className="problem-card" key={problem.id}>

              <div className="problem-card-top">
                <span className="problem-category">
                  {problem.category}
                </span>

                <span
                  className={`difficulty difficulty-${problem.difficulty.toLowerCase()}`}
                >
                  {problem.difficulty}
                </span>
              </div>

              <h2>{problem.title}</h2>

              <p className="problem-description">
                {problem.description}
              </p>

              <div className="problem-footer">
                <span className="estimated-time">
                  {problem.estimatedTime
                    ? `${problem.estimatedTime} min`
                    : "Practice"}
                </span>

                <button
                  className="start-button"
                  onClick={() => startPractice(problem.id)}
                >
                  Start Practice →
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Problem;