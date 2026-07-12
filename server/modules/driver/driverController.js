import { asyncHandler } from "../../utils/asyncHandler.js";
import { driverService } from "./driverService.js";
import { ApiError } from "../../utils/ApiError.js";

const formatDriverResponse = (driver) => {
  if (!driver) return null;
  return {
    id: driver.id,
    full_name: driver.fullName,
    license_number: driver.licenseNumber,
    license_category: driver.licenseCategory,
    license_expiry_date: driver.licenseExpiryDate,
    contact_number: driver.contactNumber,
    email: driver.email,
    address: driver.address,
    emergency_contact: driver.emergencyContact,
    safety_score: driver.safetyScore,
    status: driver.status,
    joining_date: driver.joiningDate,
    notes: driver.notes,
    created_at: driver.createdAt,
    updated_at: driver.updatedAt,
    deleted_at: driver.deletedAt,
  };
};

export const createDriver = asyncHandler(async (req, res) => {
  try {
    const driver = await driverService.createDriver(req.body);
    return res.status(201).json({
      success: true,
      message: "Driver created successfully",
      driver: formatDriverResponse(driver),
    });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: "Driver license already exists",
      });
    }
    throw error;
  }
});

export const getDrivers = asyncHandler(async (req, res) => {
  const result = await driverService.getDrivers(req.query);
  return res.status(200).json({
    success: true,
    data: result.data.map(formatDriverResponse),
    pagination: result.pagination,
  });
});

export const getDriverById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const driver = await driverService.getDriverById(id);
  return res.status(200).json({
    success: true,
    driver: formatDriverResponse(driver),
  });
});

export const updateDriver = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const driver = await driverService.updateDriver(id, req.body);
  return res.status(200).json({
    success: true,
    message: "Driver updated successfully",
    driver: formatDriverResponse(driver),
  });
});

export const deleteDriver = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await driverService.deleteDriver(id);
  return res.status(200).json({
    success: true,
    message: "Driver deleted successfully",
  });
});

export const getAvailableDrivers = asyncHandler(async (req, res) => {
  const list = await driverService.getAvailableDrivers();
  return res.status(200).json({
    success: true,
    data: list.map(formatDriverResponse),
  });
});

export const getLicenseExpiryDrivers = asyncHandler(async (req, res) => {
  const { days } = req.query;
  const list = await driverService.getLicenseExpiryDrivers(days);
  return res.status(200).json({
    success: true,
    count: list.length,
    drivers: list.map(formatDriverResponse),
  });
});

export const getDriverStatistics = asyncHandler(async (req, res) => {
  const stats = await driverService.getDriverStatistics();
  return res.status(200).json({
    success: true,
    ...stats,
  });
});
