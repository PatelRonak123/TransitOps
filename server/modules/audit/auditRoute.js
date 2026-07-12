import { Router } from "express";
import {
  getAuditLogs,
  getAuditLogById,
  getAuditLogsByModule,
  getAuditLogsByUser,
  getAuditLogsByEntity
} from "./auditController.js";
import { verifyJWT, authorize } from "../../middleware/authMiddleware.js";
import { validateAuditFilters } from "./auditValidation.js";

const router = Router();

const allowedRoles = ["Fleet Manager", "Financial Analyst", "Safety Officer"];

router.get("/", verifyJWT, authorize(...allowedRoles), validateAuditFilters, getAuditLogs);
router.get("/:id", verifyJWT, authorize(...allowedRoles), getAuditLogById);
router.get("/module/:moduleName", verifyJWT, authorize(...allowedRoles), validateAuditFilters, getAuditLogsByModule);
router.get("/user/:userId", verifyJWT, authorize(...allowedRoles), validateAuditFilters, getAuditLogsByUser);
router.get("/entity/:entityId", verifyJWT, authorize(...allowedRoles), validateAuditFilters, getAuditLogsByEntity);

export default router;
