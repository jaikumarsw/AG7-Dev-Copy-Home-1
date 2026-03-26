import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertCalendarEventSchema,
  insertTaskSchema,
  insertNoteSchema,
  insertMainGoalSchema,
  insertLifeAreaSchema,
  insertMetricsSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ── Calendar Events ────────────────────────────────────────────────────────
  app.get("/api/calendar-events", async (_req, res) => {
    const events = await storage.getCalendarEvents();
    res.json(events);
  });

  app.post("/api/calendar-events", async (req, res) => {
    const parsed = insertCalendarEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const event = await storage.createCalendarEvent(parsed.data);
    res.status(201).json(event);
  });

  app.patch("/api/calendar-events/:id", async (req, res) => {
    const parsed = insertCalendarEventSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const event = await storage.updateCalendarEvent(req.params.id, parsed.data);
    if (!event) return res.status(404).json({ error: "Not found" });
    res.json(event);
  });

  app.delete("/api/calendar-events/:id", async (req, res) => {
    await storage.deleteCalendarEvent(req.params.id);
    res.status(204).send();
  });

  // ── Tasks ──────────────────────────────────────────────────────────────────
  app.get("/api/tasks", async (_req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    const parsed = insertTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const task = await storage.createTask(parsed.data);
    res.status(201).json(task);
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    const parsed = insertTaskSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const task = await storage.updateTask(req.params.id, parsed.data);
    if (!task) return res.status(404).json({ error: "Not found" });
    res.json(task);
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    await storage.deleteTask(req.params.id);
    res.status(204).send();
  });

  // ── Main Goal ──────────────────────────────────────────────────────────────
  app.get("/api/main-goal", async (_req, res) => {
    const goal = await storage.getMainGoal();
    res.json(goal ?? null);
  });

  app.post("/api/main-goal", async (req, res) => {
    const parsed = insertMainGoalSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const goal = await storage.createMainGoal(parsed.data);
    res.status(201).json(goal);
  });

  app.patch("/api/main-goal/:id", async (req, res) => {
    const parsed = insertMainGoalSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const goal = await storage.updateMainGoal(req.params.id, parsed.data);
    if (!goal) return res.status(404).json({ error: "Not found" });
    res.json(goal);
  });

  app.delete("/api/main-goal/:id", async (req, res) => {
    await storage.deleteMainGoal(req.params.id);
    res.status(204).send();
  });

  app.put("/api/main-goal", async (req, res) => {
    const parsed = z.object({ text: z.string().min(1) }).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const goal = await storage.upsertMainGoal(parsed.data.text);
    res.json(goal);
  });

  // ── Notes ──────────────────────────────────────────────────────────────────
  app.get("/api/notes", async (_req, res) => {
    const notes = await storage.getNotes();
    res.json(notes);
  });

  app.post("/api/notes", async (req, res) => {
    const parsed = insertNoteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const note = await storage.createNote(parsed.data);
    res.status(201).json(note);
  });

  app.delete("/api/notes/:id", async (req, res) => {
    await storage.deleteNote(req.params.id);
    res.status(204).send();
  });

  // ── Life Areas ─────────────────────────────────────────────────────────────
  app.get("/api/life-areas", async (_req, res) => {
    const areas = await storage.getLifeAreas();
    res.json(areas);
  });

  app.post("/api/life-areas", async (req, res) => {
    const parsed = insertLifeAreaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const area = await storage.createLifeArea(parsed.data);
    res.status(201).json(area);
  });

  app.patch("/api/life-areas/:id", async (req, res) => {
    const parsed = insertLifeAreaSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const area = await storage.updateLifeArea(req.params.id, parsed.data);
    if (!area) return res.status(404).json({ error: "Not found" });
    res.json(area);
  });

  app.delete("/api/life-areas/:id", async (req, res) => {
    await storage.deleteLifeArea(req.params.id);
    res.status(204).send();
  });

  // ── Metrics ────────────────────────────────────────────────────────────────
  app.get("/api/metrics", async (_req, res) => {
    const m = await storage.getMetrics();
    res.json(m ?? null);
  });

  app.post("/api/metrics", async (req, res) => {
    const parsed = insertMetricsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const m = await storage.createMetrics(parsed.data);
    res.status(201).json(m);
  });

  app.patch("/api/metrics/:id", async (req, res) => {
    const parsed = insertMetricsSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const m = await storage.updateMetrics(req.params.id, parsed.data);
    if (!m) return res.status(404).json({ error: "Not found" });
    res.json(m);
  });

  app.delete("/api/metrics/:id", async (req, res) => {
    await storage.deleteMetrics(req.params.id);
    res.status(204).send();
  });

  app.patch("/api/metrics", async (req, res) => {
    const parsed = insertMetricsSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const m = await storage.upsertMetrics(parsed.data);
    res.json(m);
  });

  return httpServer;
}
