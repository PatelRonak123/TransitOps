import { pgTable, uuid, varchar, boolean, timestamp, integer, text } from "drizzle-orm/pg-core";
import { roleEnum } from "./enum.js";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  role: roleEnum("role").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
  accountLockedUntil: timestamp("account_locked_until"),
  lastFailedLogin: timestamp("last_failed_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const authLogs = pgTable("auth_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  email: varchar("email").notNull(),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  status: varchar("status", { length: 20 }).notNull(), // SUCCESS, FAILED, LOCKED
  createdAt: timestamp("created_at").defaultNow().notNull(),
});