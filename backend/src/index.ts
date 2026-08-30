import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import express from "express";
import cors from "cors";
import { dailyLogRouter } from "./routes/dailyLog";
import { mediaLogRouter } from "./routes/mediaLog";
import { exercisesRouter } from "./routes/exercises";
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
app.use("/api/habits", habitsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/period-notes", periodNotesRouter);

// In produzione il frontend viene buildato in ../frontend/dist e servito
// da questo stesso servizio (un solo servizio Railway = niente CORS/domini extra).
const frontendDist = path.join(__dirname, "../../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api") || req.path === "/health") {
      return next();
    }
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(port, () => console.log(`API in ascolto su porta ${port}`));
