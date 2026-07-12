import { pgTable, uuid, varchar, decimal, text, timestamp, date } from "drizzle-orm/pg-core";
import { tripStatusEnum } from "../../db/Schema/enum.js";
import { vehicles } from "../vehicle/vehicleModel.js";
import { drivers } from "../driver/driverModel.js";
import { users } from "../../db/Schema/schema.js";

export const trips = pgTable("trips", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripNumber: varchar("trip_number", { length: 30 }).notNull().unique(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  driverId: uuid("driver_id").references(() => drivers.id).notNull(),
  source: varchar("source", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  cargoWeight: decimal("cargo_weight", { precision: 10, scale: 2 }).notNull(),
  plannedDistance: decimal("planned_distance", { precision: 10, scale: 2 }),
  actualDistance: decimal("actual_distance", { precision: 10, scale: 2 }),
  dispatchDate: timestamp("dispatch_date"),
  completionDate: timestamp("completion_date"),
  startOdometer: decimal("start_odometer", { precision: 10, scale: 2 }),
  endOdometer: decimal("end_odometer", { precision: 10, scale: 2 }),
  fuelConsumed: decimal("fuel_consumed", { precision: 10, scale: 2 }),
  revenue: decimal("revenue", { precision: 12, scale: 2 }),
  status: tripStatusEnum("status").default("Draft").notNull(),
  remarks: text("remarks"),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
