import express from "express";
import dotenv from "dotenv";
import prisma from "./lib/prisma.js";
import wrapAsync from "./utils/wrapAsync.js";
import problemRoutes from "./routes/problemRoutes.js";
import attemptRoutes from "./routes/attemptRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import evaluationRoutes from "./routes/evaluationRoutes.js";
import cors from "cors";

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json()); //parsing
app.use("/api/problems", problemRoutes); //getting problem routes
app.use("/api/attempts", attemptRoutes);// attempt routes
app.use("/api/submissions", submissionRoutes);
app.use("/api/evaluations", evaluationRoutes);


app.get(
  "/",
  wrapAsync(async (req, res) => {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      message: "LLD Platform API is running",
      database: "Connected",
    });
  })
);


//global error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});