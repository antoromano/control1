import "dotenv/config";
import express from "express";
import cors from "cors";
import { dailyLogRouter } from "./routes/dailyLog";
import { mediaLogRouter } from "./routes/mediaLog";
import { exercisesRouter } from "./routes/exercises";
import { exerciseLogsRouter } from "./routes/exerciseLogs";
import { habitsRouter } from "./routes/habits";
import { statsRouter } from "./routes/stats";
import { periodNotesRouter } from "./routes/periodNotes";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/daily-logs", dailyLogRouter);
app.use("/api/media-logs", mediaLogRouter);
app.use("/api/exercises", exercisesRouter);
app.use("/api/exercise-logs", exerciseLogsRouter);
app.use("/api/habits", habitsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/period-notes", periodNotesRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(port, () => console.log(`API in ascolto su porta ${port}`));
