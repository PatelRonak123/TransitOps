import { asyncHandler } from "../../utils/asyncHandler.js";
import { vehicleService } from "./vehicleService.js";
import { ApiError } from "../../utils/ApiError.js";
import { auditLogger } from "../../utils/auditLogger.js";

const formatVehicleResponse = (vehicle) => {
  if (!vehicle) return null;
  return {
    id: vehicle.id,
    registration_number: vehicle.registrationNumber,
    vehicle_name: vehicle.vehicleName,
    vehicle_model: vehicle.vehicleModel,
    vehicle_type: vehicle.vehicleType,
    max_load_capacity: vehicle.maxLoadCapacity ? Number(vehicle.maxLoadCapacity) : null,
    odometer: vehicle.odometer ? Number(vehicle.odometer) : 0,
    acquisition_cost: vehicle.acquisitionCost ? Number(vehicle.acquisitionCost) : null,
    status: vehicle.status,
    region: vehicle.region,
    notes: vehicle.notes,
    created_at: vehicle.createdAt,
    updated_at: vehicle.updatedAt,
    deleted_at: vehicle.deletedAt,
  };
};

export const createVehicle = asyncHandler(async (req, res) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);
    await auditLogger({
      action: "CREATE",
      module: "Vehicle",
      entityId: vehicle.id,
      entityName: "Vehicle",
      newData: formatVehicleResponse(vehicle),
      description: `Vehicle created: ${vehicle.registrationNumber} (${vehicle.vehicleName})`,
      request: req,
      status: "SUCCESS"
    });
    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      vehicle: formatVehicleResponse(vehicle),
    });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    throw error;
  }
});

export const getVehicles = asyncHandler(async (req, res) => {
  const result = await vehicleService.getVehicles(req.query);
  return res.status(200).json({
    success: true,
    data: result.data.map(formatVehicleResponse),
    pagination: result.pagination,
  });
});

export const getVehicleById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vehicle = await vehicleService.getVehicleById(id);
  return res.status(200).json({
    success: true,
    vehicle: formatVehicleResponse(vehicle),
  });
});

export const updateVehicle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vehicle = await vehicleService.updateVehicle(id, req.body);
  await auditLogger({
    action: "UPDATE",
    module: "Vehicle",
    entityId: vehicle.id,
    entityName: "Vehicle",
    newData: formatVehicleResponse(vehicle),
    description: `Vehicle updated: ${vehicle.registrationNumber}`,
    request: req,
    status: "SUCCESS"
  });
  return res.status(200).json({
    success: true,
    message: "Vehicle updated successfully",
    vehicle: formatVehicleResponse(vehicle),
  });
});

export const deleteVehicle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await vehicleService.deleteVehicle(id);
  await auditLogger({
    action: "DELETE",
    module: "Vehicle",
    entityId: id,
    entityName: "Vehicle",
    description: `Vehicle deleted: ID ${id}`,
    request: req,
    status: "SUCCESS"
  });
  return res.status(200).json({
    success: true,
    message: "Vehicle deleted successfully",
  });
});

export const getAvailableVehicles = asyncHandler(async (req, res) => {
  const vehiclesList = await vehicleService.getAvailableVehicles();
  return res.status(200).json({
    success: true,
    data: vehiclesList.map(formatVehicleResponse),
  });
});

export const getVehicleStatistics = asyncHandler(async (req, res) => {
  const stats = await vehicleService.getVehicleStatistics();
  return res.status(200).json({
    success: true,
    ...stats,
  });
});

export const diagnoseVehicle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await vehicleService.diagnoseVehicle(id);
  return res.status(200).json(result);
});
