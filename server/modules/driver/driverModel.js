import { pgTable, uuid, varchar, text, integer, timestamp, date } from "drizzle-orm/pg-core";
import { licenseCategoryEnum, driverStatusEnum } from "../../db/Schema/enum.js";

export const drivers = pgTable("drivers", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  licenseNumber: varchar("license_number", { length: 50 }).notNull().unique(),
  licenseCategory: licenseCategoryEnum("license_category").notNull(),
  licenseExpiryDate: date("license_expiry_date").notNull(),
  contactNumber: varchar("contact_number", { length: 20 }).notNull(),
  email: varchar("email", { length: 100 }),
  address: text("address"),
  emergencyContact: varchar("emergency_contact", { length: 20 }),
  safetyScore: integer("safety_score").default(100).notNull(),
  status: driverStatusEnum("status").default("Available").notNull(),
  joiningDate: date("joining_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
