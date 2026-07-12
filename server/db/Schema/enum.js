import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "Fleet Manager",
  "Dispatcher",
  "Safety Officer",
  "Financial Analyst"
]);

export const vehicleTypeEnum = pgEnum("vehicle_type", [
  "Truck",
  "Van",
  "Pickup",
  "Trailer",
  "Mini Truck"
]);

export const vehicleStatusEnum = pgEnum("status", [
  "Available",
  "On Trip",
  "In Shop",
  "Retired"
]);

export const licenseCategoryEnum = pgEnum("license_category", [
  "LMV",
  "HMV",
  "MCWG",
  "Transport",
  "Heavy Transport"
]);

export const driverStatusEnum = pgEnum("driver_status", [
  "Available",
  "On Trip",
  "Off Duty",
  "Suspended"
]);

export const tripStatusEnum = pgEnum("trip_status", [
  "Draft",
  "Dispatched",
  "Completed",
  "Cancelled"
]);

export const maintenanceTypeEnum = pgEnum("maintenance_type", [
  "Oil Change",
  "Engine Repair",
  "Tyre Replacement",
  "Battery",
  "General Service",
  "Brake Service",
  "Accident Repair",
  "Other"
]);

export const maintenancePriorityEnum = pgEnum("maintenance_priority", [
  "Low",
  "Medium",
  "High",
  "Critical"
]);

export const maintenanceStatusEnum = pgEnum("maintenance_status", [
  "Open",
  "In Progress",
  "Completed",
  "Cancelled"
]);

export const fuelTypeEnum = pgEnum("fuel_type", [
  "Diesel",
  "Petrol",
  "CNG",
  "Electric",
  "Other"
]);

export const expenseTypeEnum = pgEnum("expense_type", [
  "Fuel",
  "Maintenance",
  "Repair",
  "Insurance",
  "Registration",
  "Parking",
  "Toll",
  "Driver Allowance",
  "Cleaning",
  "Tyre Replacement",
  "Battery",
  "Miscellaneous"
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "Cash",
  "UPI",
  "Card",
  "Bank Transfer",
  "Cheque"
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "Paid",
  "Pending"
]);





