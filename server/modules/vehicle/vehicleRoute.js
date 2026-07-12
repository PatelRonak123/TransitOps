import { Router } from "express";
import {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles,
  getVehicleStatistics
} from "./vehicleController.js";
import { verifyJWT, authorize } from "../../middleware/authMiddleware.js";
import { validateCreateVehicle, validateUpdateVehicle } from "../../utils/validation.js";

const router = Router();

// Read operations - Allowed for Fleet Manager, Dispatcher, Safety Officer, Financial Analyst
router.get("/available", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getAvailableVehicles);
router.get("/statistics", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getVehicleStatistics);
router.get("/", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getVehicles);
router.get("/:id", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getVehicleById);

// Write operations - Allowed only for Fleet Manager
router.post("/", verifyJWT, authorize("Fleet Manager"), validateCreateVehicle, createVehicle);
router.patch("/:id", verifyJWT, authorize("Fleet Manager"), validateUpdateVehicle, updateVehicle);
router.delete("/:id", verifyJWT, authorize("Fleet Manager"), deleteVehicle);

export default router;
