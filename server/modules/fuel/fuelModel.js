import { pgTable, uuid, varchar, decimal, text, timestamp, date } from "drizzle-orm/pg-core";
import { fuelTypeEnum } from "../../db/Schema/enum.js";
import { vehicles } from "../vehicle/vehicleModel.js";
import { trips } from "../trip/tripModel.js";
import { users } from "../../db/Schema/schema.js";

export const fuelLogs = pgTable("fuel_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  fuelLogNumber: varchar("fuel_log_number", { length: 30 }).notNull().unique(),
  tripId: uuid("trip_id").references(() => trips.id).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  fuelStation: varchar("fuel_station", { length: 150 }),
  fuelType: fuelTypeEnum("fuel_type").notNull(),
  liters: decimal("liters", { precision: 10, scale: 2 }).notNull(),
  pricePerLiter: decimal("price_per_liter", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 12, scale: 2 }).notNull(),
  odometerReading: decimal("odometer_reading", { precision: 10, scale: 2 }).notNull(),
  fuelEfficiency: decimal("fuel_efficiency", { precision: 10, scale: 2 }),
  fuelDate: date("fuel_date").notNull(),
  remarks: text("remarks"),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
