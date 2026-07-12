import { Router } from "express";
import {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  getTripStatistics
} from "./tripController.js";
import { verifyJWT, authorize } from "../../middleware/authMiddleware.js";
import {
  validateCreateTrip,
  validateUpdateTrip,
  validateCompleteTripBody
} from "../../utils/validation.js";

const router = Router();

// Read operations - Allowed for Fleet Manager, Dispatcher, Safety Officer, Financial Analyst
router.get("/statistics", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getTripStatistics);
router.get("/", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getTrips);
router.get("/:id", verifyJWT, authorize("Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"), getTripById);

// Write operations - Allowed only for Fleet Manager and Dispatcher
router.post("/", verifyJWT, authorize("Fleet Manager", "Dispatcher"), validateCreateTrip, createTrip);
router.patch("/:id", verifyJWT, authorize("Fleet Manager", "Dispatcher"), validateUpdateTrip, updateTrip);
router.delete("/:id", verifyJWT, authorize("Fleet Manager", "Dispatcher"), deleteTrip);

// Action operations - Allowed only for Fleet Manager and Dispatcher
router.post("/:id/dispatch", verifyJWT, authorize("Fleet Manager", "Dispatcher"), dispatchTrip);
router.post("/:id/complete", verifyJWT, authorize("Fleet Manager", "Dispatcher"), validateCompleteTripBody, completeTrip);
router.post("/:id/cancel", verifyJWT, authorize("Fleet Manager", "Dispatcher"), cancelTrip);

export default router;
