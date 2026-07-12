import { pgTable, uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { roleEnum } from "./enum.js";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  role: roleEnum("role").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});