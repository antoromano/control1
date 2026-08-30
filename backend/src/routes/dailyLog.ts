import { Router } from "express";
import { prisma } from "../lib/prisma";

export const dailyLogRouter = Router();

dailyLogRouter.get("/", async (req, res) => {
  const { from, to } = req.query;
  const logs = await prisma.dailyLog.findMany({
    where: {
      date: {
        gte: from ? new Date(from as string) : undefined,
        lte: to ? new Date(to as string) : undefined,
      },
    },
    orderBy: { date: "desc" },
  });
  res.json(logs);
});

dailyLogRouter.post("/", async (req, res) => {
  const { date, kcal, carbsG, proteinG, fatG, sleepHours } = req.body;
  const log = await prisma.dailyLog.upsert({
    where: { date: new Date(date) },
    update: { kcal, carbsG, proteinG, fatG, sleepHours },
    create: { date: new Date(date), kcal, carbsG, proteinG, fatG, sleepHours },
  });
  res.status(201).json(log);
});
