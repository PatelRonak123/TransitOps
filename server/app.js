import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { corsMiddleware, corsPreflight } from "./config/corsConfig.js";
import authRoutes from "./routes/authRoute.js";
import vehicleRoutes from "./modules/vehicle/vehicleRoute.js";
import driverRoutes from "./modules/driver/driverRoute.js";
import tripRoutes from "./modules/trip/tripRoute.js";
import maintenanceRoutes from "./modules/maintenance/maintenanceRoute.js";
import fuelRoutes from "./modules/fuel/fuelRoute.js";
import expenseRoutes from "./modules/expense/expenseRoute.js";
import { ErrorHandler } from "./utils/ErrorHandler.js";
import { ENV } from "./config/env.js";

export const app = express();

const isProd = ENV.NODE_ENV === "production";

if (isProd) {
  app.set("trust proxy", true);
}

app.use(corsMiddleware());
app.use(corsPreflight);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Route Registration
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/fuel", fuelRoutes);
app.use("/api/expenses", expenseRoutes);

app.get("/health", (req, res) => {
  res.send("Server is running and healthy!");
});

// Centralized Error Handler
app.use(ErrorHandler);

export default app;
