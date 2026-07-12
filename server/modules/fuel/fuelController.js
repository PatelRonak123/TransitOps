import { asyncHandler } from "../../utils/asyncHandler.js";
import { fuelService } from "./fuelService.js";

const formatFuelResponse = (item) => {
  if (!item) return null;

  const f = item.fuelLog || item;
  const formatted = {
    id: f.id,
    fuel_log_number: f.fuelLogNumber,
    trip_id: f.tripId,
    vehicle_id: f.vehicleId,
    fuel_station: f.fuelStation,
    fuel_type: f.fuelType,
    liters: Number(f.liters),
    price_per_liter: Number(f.pricePerLiter),
    total_cost: Number(f.totalCost),
    odometer_reading: Number(f.odometerReading),
    fuel_efficiency: f.fuelEfficiency ? Number(f.fuelEfficiency) : null,
    fuel_date: f.fuelDate,
    remarks: f.remarks,
    created_by: f.createdBy,
    created_at: f.createdAt,
    updated_at: f.updatedAt,
    deleted_at: f.deletedAt,
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

  if (item.trip) {
    formatted.trip = {
      id: item.trip.id,
      trip_number: item.trip.tripNumber,
      status: item.trip.status,
      actual_distance: item.trip.actualDistance ? Number(item.trip.actualDistance) : null,
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

export const createFuelLog = asyncHandler(async (req, res) => {
  try {
    const log = await fuelService.createFuelLog(req.body, req.user.id);
    return res.status(201).json({
      success: true,
      message: "Fuel Log created successfully",
      data: formatFuelResponse(log),
    });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: "Fuel log already exists for this trip",
      });
    }
    throw error;
  }
});

export const getFuelLogs = asyncHandler(async (req, res) => {
  const result = await fuelService.getFuelLogs(req.query);
  return res.status(200).json({
    success: true,
    data: result.data.map(formatFuelResponse),
    pagination: result.pagination,
  });
});

export const getFuelLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const log = await fuelService.getFuelLogById(id);
  return res.status(200).json({
    success: true,
    data: formatFuelResponse(log),
  });
});

export const updateFuelLog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const log = await fuelService.updateFuelLog(id, req.body);
  return res.status(200).json({
    success: true,
    message: "Fuel Log updated successfully",
    data: formatFuelResponse(log),
  });
});

export const deleteFuelLog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await fuelService.deleteFuelLog(id);
  return res.status(200).json({
    success: true,
    message: "Fuel Log deleted successfully",
  });
});

export const getVehicleFuelHistory = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const list = await fuelService.getVehicleFuelHistory(vehicleId);
  return res.status(200).json({
    success: true,
    data: list.map(formatFuelResponse),
  });
});

export const getTripFuelLog = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const log = await fuelService.getTripFuelLog(tripId);
  return res.status(200).json({
    success: true,
    data: formatFuelResponse(log),
  });
});

export const getMonthlyFuelReport = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) {
    return res.status(400).json({
      success: false,
      message: "Month and year are required query parameters",
    });
  }
  const report = await fuelService.getMonthlyFuelReport(month, year);
  return res.status(200).json({
    success: true,
    data: {
      ...report,
      logs: report.logs.map(formatFuelResponse),
    },
  });
});

export const getFuelStatistics = asyncHandler(async (req, res) => {
  const stats = await fuelService.getFuelStatistics();
  return res.status(200).json({
    success: true,
    ...stats,
  });
});
