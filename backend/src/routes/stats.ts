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

// Volume allenante per gruppo muscolare nel periodo, per capire dove
// aumentare/diminuire volume nella settimana/mese successivo.
// Ogni esercizio può coinvolgere più gruppi muscolari con un fattore diverso
// (es. distensioni: petto 1.0, tricipiti 0.5 — coinvolgimento secondario).
// Il peso corporeo (0 nei log a corpo libero) conta come 1 per non azzerare
// il volume delle serie a corpo libero.
statsRouter.get("/muscle-volume", async (req, res) => {
  const logs = await prisma.exerciseLog.findMany({
    where: { date: parseRange(req) },
    include: { exercise: { include: { muscles: true } } },
  });

  const volumeByMuscle = new Map<string, number>();
  for (const log of logs) {
    const effectiveWeight = log.weight > 0 ? log.weight : 1;
    for (const m of log.exercise.muscles) {
      const contribution = log.reps * effectiveWeight * m.factor;
      volumeByMuscle.set(m.muscleGroup, (volumeByMuscle.get(m.muscleGroup) ?? 0) + contribution);
    }
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
