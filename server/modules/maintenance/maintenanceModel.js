import { pgTable, uuid, varchar, decimal, text, timestamp, date } from "drizzle-orm/pg-core";
import { maintenanceTypeEnum, maintenancePriorityEnum, maintenanceStatusEnum } from "../../db/Schema/enum.js";
import { vehicles } from "../vehicle/vehicleModel.js";
import { users } from "../../db/Schema/schema.js";

export const maintenanceLogs = pgTable("maintenance_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  maintenanceNumber: varchar("maintenance_number", { length: 30 }).notNull().unique(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  maintenanceType: maintenanceTypeEnum("maintenance_type").notNull(),
  issueTitle: varchar("issue_title", { length: 255 }).notNull(),
  description: text("description"),
  workshopName: varchar("workshop_name", { length: 150 }),
  technicianName: varchar("technician_name", { length: 150 }),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  priority: maintenancePriorityEnum("priority").notNull(),
  status: maintenanceStatusEnum("status").default("Open").notNull(),
  remarks: text("remarks"),
  startDate: date("start_date"),
  expectedCompletionDate: date("expected_completion_date"),
  completionDate: date("completion_date"),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
