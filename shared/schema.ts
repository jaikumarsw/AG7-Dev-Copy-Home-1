import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Calendar Events — ISO datetime strings for flexibility
export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  startAt: text("start_at").notNull(),
  endAt: text("end_at").notNull(),
  color: text("color").notNull().default("#ff7539"),
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents)
  .omit({ id: true })
  .extend({
    startAt: z.string().datetime({ message: "startAt must be an ISO datetime" }),
    endAt: z.string().datetime({ message: "endAt must be an ISO datetime" }),
  });
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;

// Tasks
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  status: text("status").notNull().default("in progress"),
  order: integer("order").notNull().default(0),
});

export const insertTaskSchema = createInsertSchema(tasks)
  .omit({ id: true })
  .extend({
    status: z.enum(["done", "in progress", "closed"]).default("in progress"),
  });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Main Goal
export const mainGoal = pgTable("main_goal", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
});

export const insertMainGoalSchema = createInsertSchema(mainGoal).omit({ id: true });
export type InsertMainGoal = z.infer<typeof insertMainGoalSchema>;
export type MainGoal = typeof mainGoal.$inferSelect;

// Notes (for "More" / documents section)
export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertNoteSchema = createInsertSchema(notes)
  .omit({ id: true })
  .extend({
    createdAt: z.string().datetime({ message: "createdAt must be an ISO datetime" }),
  });
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

// Life Areas
export const lifeAreas = pgTable("life_areas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  label: text("label").notNull(),
  progress: integer("progress").notNull().default(0),
  order: integer("order").notNull().default(0),
});

export const insertLifeAreaSchema = createInsertSchema(lifeAreas)
  .omit({ id: true })
  .extend({
    progress: z.number().int().min(0).max(100).default(0),
  });
export type InsertLifeArea = z.infer<typeof insertLifeAreaSchema>;
export type LifeArea = typeof lifeAreas.$inferSelect;

// Messages / Conversations
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  avatarInitials: text("avatar_initials").notNull().default(""),
  avatarColor: text("avatar_color").notNull().default("#ff7539"),
  lastMessage: text("last_message").notNull().default(""),
  lastMessageAt: text("last_message_at").notNull(),
  unreadCount: integer("unread_count").notNull().default(0),
});

export const insertConversationSchema = createInsertSchema(conversations)
  .omit({ id: true })
  .extend({
    lastMessageAt: z.string().datetime({ message: "lastMessageAt must be an ISO datetime" }),
  });
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  senderName: text("sender_name").notNull(),
  content: text("content").notNull(),
  sentAt: text("sent_at").notNull(),
  isOwn: integer("is_own").notNull().default(0),
});

export const insertMessageSchema = createInsertSchema(messages)
  .omit({ id: true })
  .extend({
    sentAt: z.string().datetime({ message: "sentAt must be an ISO datetime" }),
    isOwn: z.number().int().min(0).max(1).default(0),
  });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Metrics
export const metrics = pgTable("metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timeSavedHours: integer("time_saved_hours").notNull().default(27),
  avgTaskSeconds: integer("avg_task_seconds").notNull().default(31),
});

export const insertMetricsSchema = createInsertSchema(metrics).omit({ id: true });
export type InsertMetrics = z.infer<typeof insertMetricsSchema>;
export type Metrics = typeof metrics.$inferSelect;
