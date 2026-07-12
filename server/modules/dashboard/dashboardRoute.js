import { Router } from "express";
import {
  getDashboardSummary,
  getFleetKPIs,
  getTripKPIs,
  getFinancialKPIs,
  getChartData,
  getTopVehicles,
  getAlerts
} from "./dashboardController.js";
import { verifyJWT, authorize } from "../../middleware/authMiddleware.js";
import { validateDashboardFilters } from "../../utils/validation.js";

const router = Router();

const allowedRoles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

router.get("/fleet", verifyJWT, authorize(...allowedRoles), validateDashboardFilters, getFleetKPIs);
router.get("/trips", verifyJWT, authorize(...allowedRoles), validateDashboardFilters, getTripKPIs);
router.get("/financial", verifyJWT, authorize(...allowedRoles), validateDashboardFilters, getFinancialKPIs);
router.get("/charts", verifyJWT, authorize(...allowedRoles), validateDashboardFilters, getChartData);
router.get("/top-vehicles", verifyJWT, authorize(...allowedRoles), validateDashboardFilters, getTopVehicles);
router.get("/alerts", verifyJWT, authorize(...allowedRoles), getAlerts);
router.get("/", verifyJWT, authorize(...allowedRoles), validateDashboardFilters, getDashboardSummary);

export default router;
