import { pgTable, uuid, varchar, decimal, text, timestamp, date } from "drizzle-orm/pg-core";
import { expenseTypeEnum, paymentMethodEnum, paymentStatusEnum } from "../../db/Schema/enum.js";
import { vehicles } from "../vehicle/vehicleModel.js";
import { trips } from "../trip/tripModel.js";
import { maintenanceLogs } from "../maintenance/maintenanceModel.js";
import { users } from "../../db/Schema/schema.js";

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  expenseNumber: varchar("expense_number", { length: 30 }).notNull().unique(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  tripId: uuid("trip_id").references(() => trips.id),
  maintenanceId: uuid("maintenance_id").references(() => maintenanceLogs.id),
  expenseType: expenseTypeEnum("expense_type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  expenseDate: date("expense_date").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull(),
  receiptUrl: varchar("receipt_url", { length: 500 }),
  vendorName: varchar("vendor_name", { length: 150 }),
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  remarks: text("remarks"),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
