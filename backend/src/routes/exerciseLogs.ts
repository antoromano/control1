import { Router } from "express";
import { prisma } from "../lib/prisma";

export const exerciseLogsRouter = Router();

// Tutte le serie registrate in un giorno, su tutti gli esercizi (vista "sessione di oggi").
exerciseLogsRouter.get("/", async (req, res) => {
  const { date } = req.query;
  const logs = await prisma.exerciseLog.findMany({
    where: date ? { date: new Date(date as string) } : undefined,
    include: { exercise: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  res.json(logs);
});

exerciseLogsRouter.delete("/:id", async (req, res) => {
  await prisma.exerciseLog.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
