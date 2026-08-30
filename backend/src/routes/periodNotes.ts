import { Router } from "express";
import { prisma } from "../lib/prisma";

export const periodNotesRouter = Router();

periodNotesRouter.get("/", async (_req, res) => {
  const notes = await prisma.periodNote.findMany({ orderBy: { periodStart: "desc" } });
  res.json(notes);
});

periodNotesRouter.post("/", async (req, res) => {
  const { periodType, periodStart, category, decision } = req.body;
  const note = await prisma.periodNote.create({
    data: { periodType, periodStart: new Date(periodStart), category, decision },
  });
  res.status(201).json(note);
});
