import express from "express";
import { createAttempt, getHistory, getAttempt, retry } from "../controllers/attemptController.js";

const router = express.Router();

router.post("/", createAttempt);
router.get("/history", getHistory);
router.get("/:id", getAttempt);
router.post("/:id/retry", retry);


export default router;