import { Router } from "express";
import { exportReport } from "./exportController.js";
import { verifyJWT, authorize } from "../../middleware/authMiddleware.js";
import { validateExportFilters } from "./exportValidation.js";

const router = Router();

const allowedRoles = ["Fleet Manager", "Financial Analyst"];

router.get("/:moduleName/:format", verifyJWT, authorize(...allowedRoles), validateExportFilters, exportReport);

export default router;
