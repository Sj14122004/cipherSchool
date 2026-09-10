import express from "express";
import { evaluateSolution, getSubmissionEvaluation } from "../controllers/evaluationController.js";

const router = express.Router();

router.post("/", evaluateSolution);
router.get("/:submissionId", getSubmissionEvaluation);


export default router;