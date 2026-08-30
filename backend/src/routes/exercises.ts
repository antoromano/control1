import { Router } from "express";
import { prisma } from "../lib/prisma";

export const exercisesRouter = Router();

exercisesRouter.get("/", async (_req, res) => {
  const exercises = await prisma.exercise.findMany({ orderBy: { name: "asc" } });
  res.json(exercises);
});

exercisesRouter.post("/", async (req, res) => {
  const { name, muscleGroup } = req.body;
  const exercise = await prisma.exercise.create({ data: { name, muscleGroup } });
  res.status(201).json(exercise);
});

// "Quadro completo": ultimo allenamento di questo esercizio, giorni trascorsi
// dall'ultima volta, e le sessioni recenti per confrontare performance/controllo.
exercisesRouter.get("/:id/history", async (req, res) => {
  const { id } = req.params;
  const recentLogs = await prisma.exerciseLog.findMany({
    where: { exerciseId: id },
    orderBy: [{ date: "desc" }, { time: "desc" }],
    take: 30,
  });

  const lastDate = recentLogs[0]?.date ?? null;
  const daysSinceLastTrained = lastDate
    ? Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  res.json({ daysSinceLastTrained, lastDate, recentLogs });
});

exercisesRouter.post("/:id/logs", async (req, res) => {
  const { id } = req.params;
  const { date, time, reps, weight, rir, restSeconds } = req.body;
  const log = await prisma.exerciseLog.create({
    data: {
      exerciseId: id,
      date: new Date(date),
      time: time ? new Date(time) : undefined,
      reps,
      weight,
      rir,
      restSeconds,
    },
  });
  res.status(201).json(log);
});
