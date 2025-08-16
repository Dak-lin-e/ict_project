import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  category: text("category").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  isPersonalizable: integer("is_personalizable").default(0), // 0 or 1 (boolean)
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nickname: text("nickname").notNull(),
  goal: text("goal").notNull(),
  targetDate: text("target_date"),
  notificationTime: text("notification_time").default("09:00"),
  darkMode: integer("dark_mode").default(0), // 0 or 1 (boolean)
  largeText: integer("large_text").default(0), // 0 or 1 (boolean)
  notificationsEnabled: integer("notifications_enabled").default(1), // 0 or 1 (boolean)
  streak: integer("streak").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userFavorites = pgTable("user_favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteId: varchar("quote_id").notNull().references(() => quotes.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userHistory = pgTable("user_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteId: varchar("quote_id").notNull().references(() => quotes.id),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true,
});

export const insertUserHistorySchema = createInsertSchema(userHistory).omit({
  id: true,
  viewedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type UserHistory = typeof userHistory.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type InsertUserHistory = z.infer<typeof insertUserHistorySchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
