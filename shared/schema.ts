import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  playerName: text("player_name").notNull(),
  score: integer("score").notNull(),
  timeElapsed: integer("time_elapsed").notNull(), // Time in seconds (will be rounded)
  createdAt: timestamp("created_at").defaultNow(),
});

export const scoreSchema = createInsertSchema(scores).pick({
  playerName: true,
  score: true,
  timeElapsed: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertScore = z.infer<typeof scoreSchema>;
export type Score = typeof scores.$inferSelect;
