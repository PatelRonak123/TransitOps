import { Router } from "express";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getVehicleExpenses,
  getTripExpenses,
  getMaintenanceExpenses,
  getMonthlyExpenseReport,
  getExpenseStatistics
} from "./expenseController.js";
import { verifyJWT, authorize } from "../../middleware/authMiddleware.js";
import { validateCreateExpense, validateUpdateExpense } from "../../utils/validation.js";

const router = Router();

// Read operations - Allowed for Fleet Manager, Financial Analyst, Dispatcher, Safety Officer
router.get("/statistics", verifyJWT, authorize("Fleet Manager", "Financial Analyst", "Dispatcher", "Safety Officer"), getExpenseStatistics);
router.get("/monthly", verifyJWT, authorize("Fleet Manager", "Financial Analyst", "Dispatcher", "Safety Officer"), getMonthlyExpenseReport);
router.get("/vehicle/:vehicleId", verifyJWT, authorize("Fleet Manager", "Financial Analyst", "Dispatcher", "Safety Officer"), getVehicleExpenses);
router.get("/trip/:tripId", verifyJWT, authorize("Fleet Manager", "Financial Analyst", "Dispatcher", "Safety Officer"), getTripExpenses);
router.get("/maintenance/:maintenanceId", verifyJWT, authorize("Fleet Manager", "Financial Analyst", "Dispatcher", "Safety Officer"), getMaintenanceExpenses);
router.get("/", verifyJWT, authorize("Fleet Manager", "Financial Analyst", "Dispatcher", "Safety Officer"), getExpenses);
router.get("/:id", verifyJWT, authorize("Fleet Manager", "Financial Analyst", "Dispatcher", "Safety Officer"), getExpenseById);

// Create operations - Allowed for Fleet Manager and Financial Analyst
router.post("/", verifyJWT, authorize("Fleet Manager", "Financial Analyst"), validateCreateExpense, createExpense);

// Update operations - Allowed for Fleet Manager and Financial Analyst
router.patch("/:id", verifyJWT, authorize("Fleet Manager", "Financial Analyst"), validateUpdateExpense, updateExpense);

// Delete operations - Allowed only for Fleet Manager
router.delete("/:id", verifyJWT, authorize("Fleet Manager"), deleteExpense);

export default router;
