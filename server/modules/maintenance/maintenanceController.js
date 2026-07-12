import { asyncHandler } from "../../utils/asyncHandler.js";
import { maintenanceService } from "./maintenanceService.js";

const formatMaintenanceResponse = (item) => {
  if (!item) return null;

  const m = item.maintenance || item;
  const formatted = {
    id: m.id,
    maintenance_number: m.maintenanceNumber,
    vehicle_id: m.vehicleId,
    maintenance_type: m.maintenanceType,
    issue_title: m.issueTitle,
    description: m.description,
    workshop_name: m.workshopName,
    technician_name: m.technicianName,
    estimated_cost: m.estimatedCost ? Number(m.estimatedCost) : null,
    actual_cost: m.actualCost ? Number(m.actualCost) : null,
    priority: m.priority,
    status: m.status,
    remarks: m.remarks,
    start_date: m.startDate,
    expected_completion_date: m.expectedCompletionDate,
    completion_date: m.completionDate,
    created_by: m.createdBy,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
    deleted_at: m.deletedAt,
  };

  if (item.vehicle) {
    formatted.vehicle = {
      id: item.vehicle.id,
      registration_number: item.vehicle.registrationNumber,
      vehicle_name: item.vehicle.vehicleName,
      vehicle_model: item.vehicle.vehicleModel,
      vehicle_type: item.vehicle.vehicleType,
    };
  }

  if (item.creator) {
    formatted.creator = {
      id: item.creator.id,
      full_name: item.creator.fullName,
      email: item.creator.email,
    };
  }

  return formatted;
};

export const createMaintenance = asyncHandler(async (req, res) => {
  try {
    const log = await maintenanceService.createMaintenance(req.body, req.user.id);
    return res.status(201).json({
      success: true,
      message: "Maintenance created successfully",
      data: formatMaintenanceResponse(log),
    });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: "Vehicle already has an active maintenance record",
      });
    }
    throw error;
  }
});

export const getMaintenances = asyncHandler(async (req, res) => {
  const result = await maintenanceService.getMaintenances(req.query);
  return res.status(200).json({
    success: true,
    data: result.data.map(formatMaintenanceResponse),
    pagination: result.pagination,
  });
});

export const getMaintenanceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const log = await maintenanceService.getMaintenanceById(id);
  return res.status(200).json({
    success: true,
    data: formatMaintenanceResponse(log),
  });
});

export const updateMaintenance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const log = await maintenanceService.updateMaintenance(id, req.body);
  return res.status(200).json({
    success: true,
    message: "Maintenance updated successfully",
    data: formatMaintenanceResponse(log),
  });
});

export const deleteMaintenance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await maintenanceService.deleteMaintenance(id);
  return res.status(200).json({
    success: true,
    message: "Maintenance deleted successfully",
  });
});

export const startMaintenance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const log = await maintenanceService.startMaintenance(id);
  return res.status(200).json({
    success: true,
    message: "Maintenance started successfully",
    data: formatMaintenanceResponse(log),
  });
});

export const completeMaintenance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const log = await maintenanceService.completeMaintenance(id, req.body);
  return res.status(200).json({
    success: true,
    message: "Maintenance completed successfully",
    data: formatMaintenanceResponse(log),
  });
});

export const cancelMaintenance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const log = await maintenanceService.cancelMaintenance(id);
  return res.status(200).json({
    success: true,
    message: "Maintenance cancelled successfully",
    data: formatMaintenanceResponse(log),
  });
});

export const getMaintenanceStatistics = asyncHandler(async (req, res) => {
  const stats = await maintenanceService.getMaintenanceStatistics();
  return res.status(200).json({
    success: true,
    ...stats,
  });
});
