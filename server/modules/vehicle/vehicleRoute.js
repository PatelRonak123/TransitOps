import { Router } from "express";
import {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles,
  getVehicleStatistics,
  diagnoseVehicle
} from "./vehicleController.js";
import { verifyJWT, authorize } from "../../middleware/authMiddleware.js";
import { validateCreateVehicle, validateUpdateVehicle } from "../../utils/validation.js";

const router = Router();

const allowedRoles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

// Read operations - Allowed for Fleet Manager, Dispatcher, Safety Officer, Financial Analyst
router.get("/available", verifyJWT, authorize(...allowedRoles), getAvailableVehicles);
router.get("/statistics", verifyJWT, authorize(...allowedRoles), getVehicleStatistics);
router.get("/:id/diagnose", verifyJWT, authorize(...allowedRoles), diagnoseVehicle);
router.get("/", verifyJWT, authorize(...allowedRoles), getVehicles);
router.get("/:id", verifyJWT, authorize(...allowedRoles), getVehicleById);

// Write operations - Allowed only for Fleet Manager
router.post("/", verifyJWT, authorize("Fleet Manager"), validateCreateVehicle, createVehicle);
router.patch("/:id", verifyJWT, authorize("Fleet Manager"), validateUpdateVehicle, updateVehicle);
router.delete("/:id", verifyJWT, authorize("Fleet Manager"), deleteVehicle);

export default router;
