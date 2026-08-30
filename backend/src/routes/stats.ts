import { Router } from "express";
import { prisma } from "../lib/prisma";

export const statsRouter = Router();

function parseRange(req: import("express").Request) {
  const { from, to } = req.query;
  return {
    gte: from ? new Date(from as string) : undefined,
    lte: to ? new Date(to as string) : undefined,
  };
}

// Volume allenante (Σ reps * peso) per gruppo muscolare nel periodo, per capire
// dove aumentare/diminuire volume nella settimana/mese successivo.
statsRouter.get("/muscle-volume", async (req, res) => {
  const logs = await prisma.exerciseLog.findMany({
    where: { date: parseRange(req) },
    include: { exercise: true },
  });

  const volumeByMuscle = new Map<string, number>();
  for (const log of logs) {
    const muscle = log.exercise.muscleGroup ?? "unknown";
    volumeByMuscle.set(muscle, (volumeByMuscle.get(muscle) ?? 0) + log.reps * log.weight);
  }

  res.json(
    Array.from(volumeByMuscle.entries()).map(([muscleGroup, volume]) => ({ muscleGroup, volume }))
  );
});

// Medie nutrizionali e di sonno nel periodo, per adattare il periodo successivo.
statsRouter.get("/nutrition", async (req, res) => {
  const result = await prisma.dailyLog.aggregate({
    where: { date: parseRange(req) },
    _avg: { kcal: true, carbsG: true, proteinG: true, fatG: true, sleepHours: true },
  });
  res.json(result._avg);
});
