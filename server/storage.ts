import {
  type User, type InsertUser,
  type CalendarEvent, type InsertCalendarEvent,
  type Task, type InsertTask,
  type MainGoal, type InsertMainGoal,
  type Note, type InsertNote,
  type LifeArea, type InsertLifeArea,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type Metrics, type InsertMetrics,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Calendar Events
  getCalendarEvents(): Promise<CalendarEvent[]>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: string, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined>;
  deleteCalendarEvent(id: string): Promise<void>;

  // Tasks
  getTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<void>;

  // Main Goal
  getMainGoal(): Promise<MainGoal | undefined>;
  createMainGoal(data: InsertMainGoal): Promise<MainGoal>;
  updateMainGoal(id: string, data: Partial<InsertMainGoal>): Promise<MainGoal | undefined>;
  deleteMainGoal(id: string): Promise<void>;
  upsertMainGoal(text: string): Promise<MainGoal>;

  // Notes
  getNotes(): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  deleteNote(id: string): Promise<void>;

  // Life Areas
  getLifeAreas(): Promise<LifeArea[]>;
  createLifeArea(area: InsertLifeArea): Promise<LifeArea>;
  updateLifeArea(id: string, area: Partial<InsertLifeArea>): Promise<LifeArea | undefined>;
  deleteLifeArea(id: string): Promise<void>;

  // Conversations
  getConversations(): Promise<Conversation[]>;
  createConversation(data: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, data: Partial<InsertConversation>): Promise<Conversation | undefined>;

  // Messages
  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(data: InsertMessage): Promise<Message>;

  // Metrics
  getMetrics(): Promise<Metrics | undefined>;
  createMetrics(data: InsertMetrics): Promise<Metrics>;
  updateMetrics(id: string, data: Partial<InsertMetrics>): Promise<Metrics | undefined>;
  deleteMetrics(id: string): Promise<void>;
  upsertMetrics(data: Partial<InsertMetrics>): Promise<Metrics>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private calendarEvents: Map<string, CalendarEvent>;
  private tasks: Map<string, Task>;
  private mainGoalMap: Map<string, MainGoal>;
  private notes: Map<string, Note>;
  private lifeAreas: Map<string, LifeArea>;
  private conversationsMap: Map<string, Conversation>;
  private messagesMap: Map<string, Message>;
  private metricsMap: Map<string, Metrics>;

  constructor() {
    this.users = new Map();
    this.calendarEvents = new Map();
    this.tasks = new Map();
    this.mainGoalMap = new Map();
    this.notes = new Map();
    this.lifeAreas = new Map();
    this.conversationsMap = new Map();
    this.messagesMap = new Map();
    this.metricsMap = new Map();
    this._seed();
  }

  private _seed() {
    const goalId = randomUUID();
    this.mainGoalMap.set(goalId, {
      id: goalId,
      text: "I strive for steady growth and balance, improving my daily routine, nutrition, and sleep. In business, I aim to scale the studio internationally, attracting at least 10 new clients and growing revenue by 50% while keeping a healthy work-life balance. Learning, exploring new opportunities, and setting ambitious goals.",
    });

    const taskSeed = [
      { title: "Establish a workflow", status: "done", order: 1 },
      { title: "Fitness", status: "in progress", order: 2 },
      { title: "Establish a workflow", status: "closed", order: 3 },
    ];
    taskSeed.forEach((t) => {
      const id = randomUUID();
      this.tasks.set(id, { id, ...t });
    });

    const areaSeed = [
      { label: "Dev", progress: 75, order: 1 },
      { label: "Fitness", progress: 45, order: 2 },
      { label: "Life balance", progress: 30, order: 3 },
    ];
    areaSeed.forEach((a) => {
      const id = randomUUID();
      this.lifeAreas.set(id, { id, ...a });
    });

    const metricsId = randomUUID();
    this.metricsMap.set(metricsId, { id: metricsId, timeSavedHours: 27, avgTaskSeconds: 31 });

    // Seed conversations + messages
    const conv1Id = randomUUID();
    const conv2Id = randomUUID();
    const conv3Id = randomUUID();
    const now = new Date();
    const h = (hrs: number) => new Date(now.getTime() - hrs * 3600000).toISOString();

    this.conversationsMap.set(conv1Id, {
      id: conv1Id, name: "Tina Miller", avatarInitials: "TM", avatarColor: "#ff7539",
      lastMessage: "Sounds good, I'll send it over!", lastMessageAt: h(0.5), unreadCount: 2,
    });
    this.conversationsMap.set(conv2Id, {
      id: conv2Id, name: "Alex Johnson", avatarInitials: "AJ", avatarColor: "#3b82f6",
      lastMessage: "Can we reschedule the meeting?", lastMessageAt: h(3), unreadCount: 0,
    });
    this.conversationsMap.set(conv3Id, {
      id: conv3Id, name: "Design Team", avatarInitials: "DT", avatarColor: "#22c55e",
      lastMessage: "New mockups are ready for review", lastMessageAt: h(24), unreadCount: 5,
    });

    const msgSeed = [
      { id: randomUUID(), conversationId: conv1Id, senderName: "Tina Miller", content: "Hey! Did you get a chance to look at the new project brief?", sentAt: h(2), isOwn: 0 },
      { id: randomUUID(), conversationId: conv1Id, senderName: "You", content: "Yes, just finished reading it. Looks great overall!", sentAt: h(1.5), isOwn: 1 },
      { id: randomUUID(), conversationId: conv1Id, senderName: "Tina Miller", content: "Awesome. Do you think we can hit the deadline?", sentAt: h(1), isOwn: 0 },
      { id: randomUUID(), conversationId: conv1Id, senderName: "You", content: "I think so, let me check the timeline and get back to you.", sentAt: h(0.8), isOwn: 1 },
      { id: randomUUID(), conversationId: conv1Id, senderName: "Tina Miller", content: "Sounds good, I'll send it over!", sentAt: h(0.5), isOwn: 0 },
      { id: randomUUID(), conversationId: conv2Id, senderName: "Alex Johnson", content: "Hey, are you free Thursday at 3pm?", sentAt: h(5), isOwn: 0 },
      { id: randomUUID(), conversationId: conv2Id, senderName: "You", content: "Thursday works for me!", sentAt: h(4), isOwn: 1 },
      { id: randomUUID(), conversationId: conv2Id, senderName: "Alex Johnson", content: "Can we reschedule the meeting?", sentAt: h(3), isOwn: 0 },
      { id: randomUUID(), conversationId: conv3Id, senderName: "Design Team", content: "New mockups are ready for review", sentAt: h(24), isOwn: 0 },
    ];
    msgSeed.forEach(m => this.messagesMap.set(m.id, m));
  }

  // ── Users ──────────────────────────────────────────────────────────────────
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // ── Calendar Events ────────────────────────────────────────────────────────
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return Array.from(this.calendarEvents.values());
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const id = randomUUID();
    const newEvent: CalendarEvent = {
      id,
      title: event.title,
      description: event.description ?? "",
      startAt: event.startAt,
      endAt: event.endAt,
      color: event.color ?? "#ff7539",
    };
    this.calendarEvents.set(id, newEvent);
    return newEvent;
  }

  async updateCalendarEvent(id: string, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined> {
    const existing = this.calendarEvents.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...event };
    this.calendarEvents.set(id, updated);
    return updated;
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    this.calendarEvents.delete(id);
  }

  // ── Tasks ──────────────────────────────────────────────────────────────────
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => a.order - b.order);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = randomUUID();
    const newTask: Task = {
      id,
      title: task.title,
      status: task.status ?? "in progress",
      order: task.order ?? 0,
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined> {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...task };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    this.tasks.delete(id);
  }

  // ── Main Goal ──────────────────────────────────────────────────────────────
  async getMainGoal(): Promise<MainGoal | undefined> {
    const items = Array.from(this.mainGoalMap.values());
    return items[0];
  }

  async createMainGoal(data: InsertMainGoal): Promise<MainGoal> {
    const id = randomUUID();
    const goal: MainGoal = { id, ...data };
    this.mainGoalMap.set(id, goal);
    return goal;
  }

  async updateMainGoal(id: string, data: Partial<InsertMainGoal>): Promise<MainGoal | undefined> {
    const existing = this.mainGoalMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.mainGoalMap.set(id, updated);
    return updated;
  }

  async deleteMainGoal(id: string): Promise<void> {
    this.mainGoalMap.delete(id);
  }

  async upsertMainGoal(text: string): Promise<MainGoal> {
    const existing = await this.getMainGoal();
    if (existing) {
      const updated = { ...existing, text };
      this.mainGoalMap.set(existing.id, updated);
      return updated;
    }
    return this.createMainGoal({ text });
  }

  // ── Notes ──────────────────────────────────────────────────────────────────
  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async createNote(note: InsertNote): Promise<Note> {
    const id = randomUUID();
    const newNote: Note = { id, content: note.content, createdAt: note.createdAt };
    this.notes.set(id, newNote);
    return newNote;
  }

  async deleteNote(id: string): Promise<void> {
    this.notes.delete(id);
  }

  // ── Life Areas ─────────────────────────────────────────────────────────────
  async getLifeAreas(): Promise<LifeArea[]> {
    return Array.from(this.lifeAreas.values()).sort((a, b) => a.order - b.order);
  }

  async createLifeArea(area: InsertLifeArea): Promise<LifeArea> {
    const id = randomUUID();
    const newArea: LifeArea = { id, label: area.label, progress: area.progress ?? 0, order: area.order ?? 0 };
    this.lifeAreas.set(id, newArea);
    return newArea;
  }

  async updateLifeArea(id: string, area: Partial<InsertLifeArea>): Promise<LifeArea | undefined> {
    const existing = this.lifeAreas.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...area };
    this.lifeAreas.set(id, updated);
    return updated;
  }

  async deleteLifeArea(id: string): Promise<void> {
    this.lifeAreas.delete(id);
  }

  // ── Conversations ──────────────────────────────────────────────────────────
  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversationsMap.values()).sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }

  async createConversation(data: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conv: Conversation = { id, ...data };
    this.conversationsMap.set(id, conv);
    return conv;
  }

  async updateConversation(id: string, data: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const existing = this.conversationsMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.conversationsMap.set(id, updated);
    return updated;
  }

  // ── Messages ───────────────────────────────────────────────────────────────
  async getMessages(conversationId: string): Promise<Message[]> {
    return Array.from(this.messagesMap.values())
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
  }

  async createMessage(data: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const msg: Message = { id, ...data };
    this.messagesMap.set(id, msg);
    return msg;
  }

  // ── Metrics ────────────────────────────────────────────────────────────────
  async getMetrics(): Promise<Metrics | undefined> {
    const items = Array.from(this.metricsMap.values());
    return items[0];
  }

  async createMetrics(data: InsertMetrics): Promise<Metrics> {
    const id = randomUUID();
    const m: Metrics = { id, ...data };
    this.metricsMap.set(id, m);
    return m;
  }

  async updateMetrics(id: string, data: Partial<InsertMetrics>): Promise<Metrics | undefined> {
    const existing = this.metricsMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.metricsMap.set(id, updated);
    return updated;
  }

  async deleteMetrics(id: string): Promise<void> {
    this.metricsMap.delete(id);
  }

  async upsertMetrics(data: Partial<InsertMetrics>): Promise<Metrics> {
    const existing = await this.getMetrics();
    if (existing) {
      const updated = { ...existing, ...data };
      this.metricsMap.set(existing.id, updated);
      return updated;
    }
    const id = randomUUID();
    const m: Metrics = { id, timeSavedHours: 27, avgTaskSeconds: 31, ...data };
    this.metricsMap.set(id, m);
    return m;
  }
}

export const storage = new MemStorage();
