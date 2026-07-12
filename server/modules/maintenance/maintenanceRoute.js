import { Router } from "express";
import {
  createMaintenance,
  getMaintenances,
  getMaintenanceById,
  updateMaintenance,
  deleteMaintenance,
  startMaintenance,
  completeMaintenance,
  cancelMaintenance,
  getMaintenanceStatistics
} from "./maintenanceController.js";
import {
  validateCreateMaintenance,
  validateUpdateMaintenance,
  validateCompleteMaintenanceBody
} from "../../utils/validation.js";
import { authorize, verifyJWT } from "../../middleware/authMiddleware.js";

const router = Router();

// Read operations - Allowed for Fleet Manager, Dispatcher, Safety Officer, Financial Analyst
router.get("/statistics", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getMaintenanceStatistics);
router.get("/", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getMaintenances);
router.get("/:id", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getMaintenanceById);

// Write operations - Allowed only for Fleet Manager
router.post("/", verifyJWT, authorize("Fleet Manager"), validateCreateMaintenance, createMaintenance);
router.patch("/:id", verifyJWT, authorize("Fleet Manager"), validateUpdateMaintenance, updateMaintenance);
router.delete("/:id", verifyJWT, authorize("Fleet Manager"), deleteMaintenance);

// Action operations - Allowed only for Fleet Manager
router.post("/:id/start", verifyJWT, authorize("Fleet Manager"), startMaintenance);
router.post("/:id/complete", verifyJWT, authorize("Fleet Manager"), validateCompleteMaintenanceBody, completeMaintenance);
router.post("/:id/cancel", verifyJWT, authorize("Fleet Manager"), cancelMaintenance);

export default router;
