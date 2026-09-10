const API_URL = "http://localhost:5000/api";

export const getProblems = async () => {
  const response = await fetch(`${API_URL}/problems`);

  if (!response.ok) {
    throw new Error("Failed to fetch problems");
  }

  return response.json();
};

export const startAttempt = async (problemId) => {
  const response = await fetch(`${API_URL}/attempts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      problemId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to start attempt");
  }

  return response.json();
};

export const getAttempt = async (attemptId) => {
  const response = await fetch(
    `${API_URL}/attempts/${attemptId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch attempt");
  }

  return response.json();
};

export const submitSolution = async ({
  attemptId,
  language,
  code,
  explanation,
}) => {
  const response = await fetch(`${API_URL}/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      attemptId,
      language,
      code,
      explanation,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to submit solution"
    );
  }

  return data;
};

export const evaluateSubmission = async (submissionId) => {
  const response = await fetch(`${API_URL}/evaluations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      submissionId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Evaluation failed"
    );
  }

  return data;
};

export const getSubmissionEvaluation = async (
  submissionId
) => {
  const response = await fetch(
    `${API_URL}/evaluations/${submissionId}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch evaluation"
    );
  }

  return data;
};


export const getAttemptHistory = async () => {
  const response = await fetch(`${API_URL}/attempts/history`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch attempt history");
  }

  return data;
};

export const retryAttempt = async (attemptId) => {
  const response = await fetch(
    `${API_URL}/attempts/${attemptId}/retry`,
    {
      method: "POST",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to retry attempt"
    );
  }

  return data;
};