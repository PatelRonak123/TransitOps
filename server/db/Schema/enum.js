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
