import { Router } from "express";
import { prisma } from "../lib/prisma";

export const mediaLogRouter = Router();

mediaLogRouter.get("/", async (_req, res) => {
  const logs = await prisma.mediaLog.findMany({ orderBy: { date: "desc" } });
  res.json(logs);
});

mediaLogRouter.post("/", async (req, res) => {
  const { date, type, title, rating, notes } = req.body;
  const log = await prisma.mediaLog.create({
    data: { date: new Date(date), type, title, rating, notes },
  });
  res.status(201).json(log);
});
