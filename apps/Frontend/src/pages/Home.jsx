import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">
            LOW-LEVEL DESIGN PRACTICE
          </span>

          <h1>
            Master LLD Through
            <span> Real Practice</span>
          </h1>

          <p>
            Solve real-world Low-Level Design problems, submit
            your solution, and receive explainable feedback to
            improve your design skills.
          </p>

          <button
            className="hero-button"
            onClick={() => navigate("/problems")}
          >
            Start Practicing →
          </button>
        </div>
      </section>

      <section className="how-section">
        <h2>How It Works</h2>

        <div className="steps">
          <div className="step-card">
            <div className="step-number">01</div>

            <h3>Choose a Problem</h3>

            <p>
              Select an LLD problem and understand its
              requirements before starting.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>

            <h3>Design & Submit</h3>

            <p>
              Write your solution and explain your classes,
              responsibilities, and design decisions.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>

            <h3>Get Feedback</h3>

            <p>
              Receive automated and AI-powered feedback and
              understand how to improve your design.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;