import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Problem from "./pages/Problem";
import Practice from "./pages/Practice";
import Feedback from "./pages/Feedback";
import FeedbackHistory from "./pages/FeedbackHistory";

const App = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/problems" element={<Problem />} />
        <Route path="/practice/:attemptId" element={<Practice />} />
        <Route path="/feedback" element={<FeedbackHistory />} />
        <Route path="/feedback/:submissionId" element={<Feedback />} />
      </Routes>
    </>
  );
};

export default App;