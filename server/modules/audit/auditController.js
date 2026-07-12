import { asyncHandler } from "../../utils/asyncHandler.js";
import { auditService } from "./auditService.js";

export const getAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditLogs(req.query);
  return res.status(200).json({
    success: true,
    message: "Audit logs fetched successfully.",
    data: result.data,
    pagination: result.pagination
  });
});

export const getAuditLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await auditService.getAuditLogById(id);
  return res.status(200).json({
    success: true,
    message: "Audit log details fetched successfully.",
    data: result
  });
});

export const getAuditLogsByModule = asyncHandler(async (req, res) => {
  const { moduleName } = req.params;
  const result = await auditService.getAuditLogsByModule(moduleName, req.query);
  return res.status(200).json({
    success: true,
    message: `Audit logs for module ${moduleName} fetched successfully.`,
    data: result.data,
    pagination: result.pagination
  });
});

export const getAuditLogsByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await auditService.getAuditLogsByUser(userId, req.query);
  return res.status(200).json({
    success: true,
    message: `Audit logs for user ${userId} fetched successfully.`,
    data: result.data,
    pagination: result.pagination
  });
});

export const getAuditLogsByEntity = asyncHandler(async (req, res) => {
  const { entityId } = req.params;
  const result = await auditService.getAuditLogsByEntity(entityId, req.query);
  return res.status(200).json({
    success: true,
    message: `Audit logs for record history ${entityId} fetched successfully.`,
    data: result.data,
    pagination: result.pagination
  });
});
