import { Router } from "express";
import {
  getVehicleReport,
  getDriverReport,
  getTripReport,
  getFuelReport,
  getMaintenanceReport,
  getExpenseReport,
  getFinancialReport,
  getFleetUtilizationReport,
  getSummaryReport,
  getAnalytics,
  getFuelChart,
  getExpensesChart,
  getTripsChart,
  getMaintenanceChart,
  getFleetChart,
  getTopList
} from "./reportController.js";
import { verifyJWT, authorize } from "../../middleware/authMiddleware.js";
import { validateReportFilters } from "./reportValidation.js";

const router = Router();

const allowedRoles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

router.get("/vehicles", verifyJWT, authorize(...allowedRoles), validateReportFilters, getVehicleReport);
router.get("/drivers", verifyJWT, authorize(...allowedRoles), validateReportFilters, getDriverReport);
router.get("/trips", verifyJWT, authorize(...allowedRoles), validateReportFilters, getTripReport);
router.get("/fuel", verifyJWT, authorize(...allowedRoles), validateReportFilters, getFuelReport);
router.get("/maintenance", verifyJWT, authorize(...allowedRoles), validateReportFilters, getMaintenanceReport);
router.get("/expenses", verifyJWT, authorize(...allowedRoles), validateReportFilters, getExpenseReport);
router.get("/financial", verifyJWT, authorize(...allowedRoles), validateReportFilters, getFinancialReport);
router.get("/fleet-utilization", verifyJWT, authorize(...allowedRoles), validateReportFilters, getFleetUtilizationReport);
router.get("/summary", verifyJWT, authorize(...allowedRoles), validateReportFilters, getSummaryReport);
router.get("/analytics", verifyJWT, authorize(...allowedRoles), validateReportFilters, getAnalytics);

// Chart endpoints
router.get("/charts/fuel", verifyJWT, authorize(...allowedRoles), validateReportFilters, getFuelChart);
router.get("/charts/expenses", verifyJWT, authorize(...allowedRoles), validateReportFilters, getExpensesChart);
router.get("/charts/trips", verifyJWT, authorize(...allowedRoles), validateReportFilters, getTripsChart);
router.get("/charts/maintenance", verifyJWT, authorize(...allowedRoles), validateReportFilters, getMaintenanceChart);
router.get("/charts/fleet", verifyJWT, authorize(...allowedRoles), validateReportFilters, getFleetChart);

// Top Lists endpoint
router.get("/top-lists/:type", verifyJWT, authorize(...allowedRoles), validateReportFilters, getTopList);

export default router;
