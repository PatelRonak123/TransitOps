import { asyncHandler } from "../../utils/asyncHandler.js";
import { tripService } from "./tripService.js";
import { auditLogger } from "../../utils/auditLogger.js";

const formatTripResponse = (item) => {
  if (!item) return null;

  const t = item.trip || item;
  const formatted = {
    id: t.id,
    trip_number: t.tripNumber,
    vehicle_id: t.vehicleId,
    driver_id: t.driverId,
    source: t.source,
    destination: t.destination,
    cargo_weight: t.cargoWeight ? Number(t.cargoWeight) : null,
    planned_distance: t.plannedDistance ? Number(t.plannedDistance) : null,
    actual_distance: t.actualDistance ? Number(t.actualDistance) : null,
    dispatch_date: t.dispatchDate,
    completion_date: t.completionDate,
    start_odometer: t.startOdometer ? Number(t.startOdometer) : null,
    end_odometer: t.endOdometer ? Number(t.endOdometer) : null,
    fuel_consumed: t.fuelConsumed ? Number(t.fuelConsumed) : null,
    revenue: t.revenue ? Number(t.revenue) : null,
    status: t.status,
    remarks: t.remarks,
    created_by: t.createdBy,
    created_at: t.createdAt,
    updated_at: t.updatedAt,
    deleted_at: t.deletedAt,
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

  if (item.driver) {
    formatted.driver = {
      id: item.driver.id,
      full_name: item.driver.fullName,
      license_number: item.driver.licenseNumber,
      license_category: item.driver.licenseCategory,
      contact_number: item.driver.contactNumber,
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

export const createTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.createTrip(req.body, req.user.id);
  const formatted = formatTripResponse(trip);
  await auditLogger({
    action: "CREATE",
    module: "Trip",
    entityId: formatted.id,
    entityName: "Trip",
    newData: formatted,
    description: `Trip created: ${formatted.trip_number} from ${formatted.source} to ${formatted.destination}`,
    request: req,
    status: "SUCCESS",
  });
  return res.status(201).json({
    success: true,
    message: "Trip Created Successfully",
    data: formatted,
  });
});

export const getTrips = asyncHandler(async (req, res) => {
  const result = await tripService.getTrips(req.query);
  return res.status(200).json({
    success: true,
    data: result.data.map(formatTripResponse),
    pagination: result.pagination,
  });
});

export const getTripById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const trip = await tripService.getTripById(id);
  return res.status(200).json({
    success: true,
    data: formatTripResponse(trip),
  });
});

export const updateTrip = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const trip = await tripService.updateTrip(id, req.body);
  const formatted = formatTripResponse(trip);
  await auditLogger({
    action: "UPDATE",
    module: "Trip",
    entityId: formatted.id,
    entityName: "Trip",
    newData: formatted,
    description: `Trip updated: ${formatted.trip_number}`,
    request: req,
    status: "SUCCESS",
  });
  return res.status(200).json({
    success: true,
    message: "Trip updated successfully",
    data: formatted,
  });
});
export const deleteTrip = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await tripService.deleteTrip(id);
  await auditLogger({
    action: "DELETE",
    module: "Trip",
    entityId: id,
    entityName: "Trip",
    description: `Trip deleted: ID ${id}`,
    request: req,
    status: "SUCCESS",
  });
  return res.status(200).json({
    success: true,
    message: "Trip deleted successfully",
  });
});

export const dispatchTrip = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const trip = await tripService.dispatchTrip(id);
  const formatted = formatTripResponse(trip);
  await auditLogger({
    action: "DISPATCH",
    module: "Trip",
    entityId: formatted.id,
    entityName: "Trip",
    newData: formatted,
    description: `Trip dispatched: ${formatted.trip_number}`,
    request: req,
    status: "SUCCESS",
  });
  return res.status(200).json({
    success: true,
    message: "Trip dispatched successfully",
    data: formatted,
  });
});

export const completeTrip = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const trip = await tripService.completeTrip(id, req.body);
  const formatted = formatTripResponse(trip);
  await auditLogger({
    action: "COMPLETE",
    module: "Trip",
    entityId: formatted.id,
    entityName: "Trip",
    newData: formatted,
    description: `Trip completed: ${formatted.trip_number}`,
    request: req,
    status: "SUCCESS",
  });
  return res.status(200).json({
    success: true,
    message: "Trip completed successfully",
    data: formatted,
  });
});

export const cancelTrip = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const trip = await tripService.cancelTrip(id);
  const formatted = formatTripResponse(trip);
  await auditLogger({
    action: "CANCEL",
    module: "Trip",
    entityId: formatted.id,
    entityName: "Trip",
    newData: formatted,
    description: `Trip cancelled: ${formatted.trip_number}`,
    request: req,
    status: "SUCCESS",
  });
  return res.status(200).json({
    success: true,
    message: "Trip cancelled successfully",
    data: formatted,
  });
});

export const getTripStatistics = asyncHandler(async (req, res) => {
  const stats = await tripService.getTripStatistics();
  return res.status(200).json({
    success: true,
    ...stats,
  });
});
