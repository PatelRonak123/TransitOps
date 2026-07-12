import { pgTable, uuid, varchar, decimal, text, timestamp } from "drizzle-orm/pg-core";
import { vehicleTypeEnum, vehicleStatusEnum } from "../../db/Schema/enum.js";

export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),
  registrationNumber: varchar("registration_number", { length: 30 }).notNull().unique(),
  vehicleName: varchar("vehicle_name", { length: 100 }).notNull(),
  vehicleModel: varchar("vehicle_model", { length: 100 }),
  vehicleType: vehicleTypeEnum("vehicle_type").notNull(),
  maxLoadCapacity: decimal("max_load_capacity", { precision: 10, scale: 2 }).notNull(),
  odometer: decimal("odometer", { precision: 10, scale: 2 }).default("0.00").notNull(),
  acquisitionCost: decimal("acquisition_cost", { precision: 12, scale: 2 }).notNull(),
  status: vehicleStatusEnum("status").default("Available").notNull(),
  region: varchar("region", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
