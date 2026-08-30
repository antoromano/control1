import { Router } from "express";
import { prisma } from "../lib/prisma";

export const habitsRouter = Router();

habitsRouter.get("/", async (_req, res) => {
  const habits = await prisma.habit.findMany({ orderBy: { name: "asc" } });
  res.json(habits);
});

habitsRouter.post("/", async (req, res) => {
  const { name, type, trackingType } = req.body;
  const habit = await prisma.habit.create({ data: { name, type, trackingType } });
  res.status(201).json(habit);
});

habitsRouter.post("/:id/logs", async (req, res) => {
  const { id } = req.params;
  const { date, value } = req.body;
  const log = await prisma.habitLog.upsert({
    where: { habitId_date: { habitId: id, date: new Date(date) } },
    update: { value },
    create: { habitId: id, date: new Date(date), value },
  });
  res.status(201).json(log);
});
