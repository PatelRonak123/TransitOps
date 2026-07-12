import { asyncHandler } from "../../utils/asyncHandler.js";
import { expenseService } from "./expenseService.js";
import { auditLogger } from "../../utils/auditLogger.js";

const formatExpenseResponse = (item) => {
  if (!item) return null;

  const e = item.expense || item;
  const formatted = {
    id: e.id,
    expense_number: e.expenseNumber,
    vehicle_id: e.vehicleId,
    trip_id: e.tripId,
    maintenance_id: e.maintenanceId,
    expense_type: e.expenseType,
    title: e.title,
    description: e.description,
    amount: Number(e.amount),
    expense_date: e.expenseDate,
    payment_method: e.paymentMethod,
    payment_status: e.paymentStatus,
    receipt_url: e.receiptUrl,
    vendor_name: e.vendorName,
    invoice_number: e.invoiceNumber,
    remarks: e.remarks,
    created_by: e.createdBy,
    created_at: e.createdAt,
    updated_at: e.updatedAt,
    deleted_at: e.deletedAt,
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
    };
  }

  if (item.maintenance) {
    formatted.maintenance = {
      id: item.maintenance.id,
      maintenance_number: item.maintenance.maintenanceNumber,
      status: item.maintenance.status,
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

export const createExpense = asyncHandler(async (req, res) => {
  const log = await expenseService.createExpense(req.body, req.user.id);
  const formatted = formatExpenseResponse(log);
  await auditLogger({
    action: "CREATE",
    module: "Expense",
    entityId: formatted.id,
    entityName: "Expense",
    newData: formatted,
    description: `Expense created: ${formatted.expense_number} - ${formatted.title} ($${formatted.amount})`,
    request: req,
    status: "SUCCESS"
  });
  return res.status(201).json({
    success: true,
    message: "Expense created successfully",
    data: formatted,
  });
});

export const getExpenses = asyncHandler(async (req, res) => {
  const result = await expenseService.getExpenses(req.query);
  return res.status(200).json({
    success: true,
    data: result.data.map(formatExpenseResponse),
    pagination: result.pagination,
  });
});

export const getExpenseById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const log = await expenseService.getExpenseById(id);
  return res.status(200).json({
    success: true,
    data: formatExpenseResponse(log),
  });
});

export const updateExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const log = await expenseService.updateExpense(id, req.body);
  const formatted = formatExpenseResponse(log);
  await auditLogger({
    action: "UPDATE",
    module: "Expense",
    entityId: formatted.id,
    entityName: "Expense",
    newData: formatted,
    description: `Expense updated: ${formatted.expense_number}`,
    request: req,
    status: "SUCCESS"
  });
  return res.status(200).json({
    success: true,
    message: "Expense updated successfully",
    data: formatted,
  });
});
export const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await expenseService.deleteExpense(id);
  await auditLogger({
    action: "DELETE",
    module: "Expense",
    entityId: id,
    entityName: "Expense",
    description: `Expense record deleted: ID ${id}`,
    request: req,
    status: "SUCCESS"
  });
  return res.status(200).json({
    success: true,
    message: "Expense deleted successfully",
  });
});

export const getVehicleExpenses = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const list = await expenseService.getVehicleExpenses(vehicleId);
  return res.status(200).json({
    success: true,
    data: list.map(formatExpenseResponse),
  });
});

export const getTripExpenses = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const list = await expenseService.getTripExpenses(tripId);
  return res.status(200).json({
    success: true,
    data: list.map(formatExpenseResponse),
  });
});

export const getMaintenanceExpenses = asyncHandler(async (req, res) => {
  const { maintenanceId } = req.params;
  const list = await expenseService.getMaintenanceExpenses(maintenanceId);
  return res.status(200).json({
    success: true,
    data: list.map(formatExpenseResponse),
  });
});

export const getMonthlyExpenseReport = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) {
    return res.status(400).json({
      success: false,
      message: "Month and year are required query parameters",
    });
  }
  const report = await expenseService.getMonthlyExpenseReport(month, year);
  return res.status(200).json({
    success: true,
    data: {
      ...report,
      logs: report.logs.map(formatExpenseResponse),
    },
  });
});

export const getExpenseStatistics = asyncHandler(async (req, res) => {
  const stats = await expenseService.getExpenseStatistics();
  return res.status(200).json({
    success: true,
    ...stats,
  });
});
