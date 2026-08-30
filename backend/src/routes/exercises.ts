import { Router } from "express";
import { prisma } from "../lib/prisma";
import { isMuscleGroup } from "../constants/muscleGroups";

export const exercisesRouter = Router();

exercisesRouter.get("/", async (_req, res) => {
  const exercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
    include: { muscles: true },
  });
  res.json(exercises);
});

interface MuscleInput {
  muscleGroup: string;
  factor?: number;
}

exercisesRouter.post("/", async (req, res) => {
  const { name, parentId, muscles } = req.body as {
    name: string;
    parentId?: string | null;
    muscles?: MuscleInput[];
  };

  const invalid = (muscles ?? []).find((m) => !isMuscleGroup(m.muscleGroup));
  if (invalid) {
    return res.status(400).json({ error: `Gruppo muscolare non valido: ${invalid.muscleGroup}` });
  }

  const exercise = await prisma.exercise.create({
    data: {
      name,
      parentId: parentId || null,
      muscles: {
        create: (muscles ?? []).map((m) => ({
          muscleGroup: m.muscleGroup,
          factor: m.factor ?? 1,
        })),
      },
    },
    include: { muscles: true },
  });
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
  const { date, time, reps, weight, rir, restSeconds, notes } = req.body;
  const log = await prisma.exerciseLog.create({
    data: {
      exerciseId: id,
      date: new Date(date),
      time: time ? new Date(time) : undefined,
      reps,
      weight,
      rir,
      restSeconds,
      notes,
    },
  });
  res.status(201).json(log);
});
