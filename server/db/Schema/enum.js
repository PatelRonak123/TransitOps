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


