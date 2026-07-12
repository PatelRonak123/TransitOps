import { Router } from "express";
import {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  getAvailableDrivers,
  getLicenseExpiryDrivers,
  getDriverStatistics
} from "./driverController.js";
import { verifyJWT, authorize } from "../../middleware/authMiddleware.js";
import { validateCreateDriver, validateUpdateDriver } from "../../utils/validation.js";

const router = Router();

// Read operations - Allowed for Fleet Manager, Dispatcher, Safety Officer, Financial Analyst
router.get("/available", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getAvailableDrivers);
router.get("/license-expiry", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getLicenseExpiryDrivers);
router.get("/statistics", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getDriverStatistics);
router.get("/", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getDrivers);
router.get("/:id", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getDriverById);

// Write operations - POST/PATCH (Fleet Manager & Safety Officer), DELETE (Fleet Manager only)
router.post("/", verifyJWT, authorize("Fleet Manager", "Safety Officer"), validateCreateDriver, createDriver);
router.patch("/:id", verifyJWT, authorize("Fleet Manager", "Safety Officer"), validateUpdateDriver, updateDriver);
router.delete("/:id", verifyJWT, authorize("Fleet Manager"), deleteDriver);

export default router;
