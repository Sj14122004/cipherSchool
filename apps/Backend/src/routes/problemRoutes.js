import express from "express";
import { getAllProblems, getSingleProblem} from "../controllers/problemController.js";

const router = express.Router();

router.get("/", getAllProblems);
router.get("/:id", getSingleProblem);

export default router;