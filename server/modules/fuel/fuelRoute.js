import { Router } from "express";
import {
  createFuelLog,
  getFuelLogs,
  getFuelLogById,
  updateFuelLog,
  deleteFuelLog,
  getVehicleFuelHistory,
  getTripFuelLog,
  getMonthlyFuelReport,
  getFuelStatistics
} from "./fuelController.js";
import { verifyJWT, authorize } from "../../middleware/authMiddleware.js";
import { validateCreateFuelLog, validateUpdateFuelLog } from "../../utils/validation.js";

const router = Router();

// Read operations - Allowed for Fleet Manager, Dispatcher, Safety Officer, Financial Analyst
router.get("/statistics", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getFuelStatistics);
router.get("/monthly", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getMonthlyFuelReport);
router.get("/vehicle/:vehicleId", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getVehicleFuelHistory);
router.get("/trip/:tripId", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getTripFuelLog);
router.get("/", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getFuelLogs);
router.get("/:id", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getFuelLogById);

// Create operations - Allowed for Fleet Manager and Dispatcher
router.post("/", verifyJWT, authorize("Fleet Manager", "Dispatcher"), validateCreateFuelLog, createFuelLog);

// Update operations - Allowed for Fleet Manager and Dispatcher
router.patch("/:id", verifyJWT, authorize("Fleet Manager", "Dispatcher"), validateUpdateFuelLog, updateFuelLog);

// Delete operations - Allowed only for Fleet Manager
router.delete("/:id", verifyJWT, authorize("Fleet Manager"), deleteFuelLog);

export default router;
