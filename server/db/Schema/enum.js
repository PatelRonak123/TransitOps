import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "Fleet Manager",
  "Dispatcher",
  "Safety Officer",
  "Financial Analyst"
]);
