import { asyncHandler } from "../../utils/asyncHandler.js";
import { reportService } from "./reportService.js";
import { auditLogger } from "../../utils/auditLogger.js";

export const getVehicleReport = asyncHandler(async (req, res) => {
  const data = await reportService.getVehicleReport(req.query);
  await auditLogger({
    action: "CREATE",
    module: "Reports",
    description: "Vehicle Report Generated",
    request: req,
    status: "SUCCESS"
  });
  return res.status(200).json({
    success: true,
    message: "Report fetched successfully.",
    data: data.data,
    summary: data.summary,
    pagination: data.pagination
  });
});

export const getDriverReport = asyncHandler(async (req, res) => {
  const data = await reportService.getDriverReport(req.query);
  await auditLogger({
    action: "CREATE",
    module: "Reports",
    description: "Driver Report Generated",
    request: req,
    status: "SUCCESS"
  });
  return res.status(200).json({
    success: true,
    message: "Report fetched successfully.",
    data: data.data,
    summary: data.summary,
    pagination: data.pagination
  });
});

export const getTripReport = asyncHandler(async (req, res) => {
  const data = await reportService.getTripReport(req.query);
  await auditLogger({
    action: "CREATE",
    module: "Reports",
    description: "Trip Report Generated",
    request: req,
    status: "SUCCESS"
  });
  return res.status(200).json({
    success: true,
    message: "Report fetched successfully.",
    data: data.data,
    summary: data.summary,
    pagination: data.pagination
  });
});

export const getFuelReport = asyncHandler(async (req, res) => {
  const data = await reportService.getFuelReport(req.query);
  await auditLogger({
    action: "CREATE",
    module: "Reports",
    description: "Fuel Report Generated",
    request: req,
    status: "SUCCESS"
  });
  return res.status(200).json({
    success: true,
    message: "Report fetched successfully.",
    data: data.data,
    summary: data.summary,
    pagination: data.pagination
  });
});

export const getMaintenanceReport = asyncHandler(async (req, res) => {
  const data = await reportService.getMaintenanceReport(req.query);
  return res.status(200).json({
    success: true,
    message: "Report fetched successfully.",
    data: data.data,
    summary: data.summary,
    pagination: data.pagination
  });
});

export const getExpenseReport = asyncHandler(async (req, res) => {
  const data = await reportService.getExpenseReport(req.query);
  return res.status(200).json({
    success: true,
    message: "Report fetched successfully.",
    data: data.data,
    summary: data.summary,
    pagination: data.pagination
  });
});

export const getFinancialReport = asyncHandler(async (req, res) => {
  const data = await reportService.getFinancialReport(req.query);
  return res.status(200).json({
    success: true,
    message: "Report fetched successfully.",
    data: data.summary
  });
});

export const getFleetUtilizationReport = asyncHandler(async (req, res) => {
  const data = await reportService.getFleetUtilizationReport(req.query);
  return res.status(200).json({
    success: true,
    message: "Report fetched successfully.",
    data: data.data,
    pagination: data.pagination
  });
});

export const getSummaryReport = asyncHandler(async (req, res) => {
  const data = await reportService.getSummaryReport(req.query);
  return res.status(200).json({
    success: true,
    message: "Report fetched successfully.",
    data: data.summary
  });
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const data = await reportService.getAnalytics(req.query);
  return res.status(200).json({
    success: true,
    message: "Analytics fetched successfully.",
    data: data.summary
  });
});

// Chart controllers
export const getFuelChart = asyncHandler(async (req, res) => {
  const data = await reportService.getChartData("fuel", req.query);
  return res.status(200).json({
    success: true,
    message: "Chart data fetched successfully.",
    data
  });
});

export const getExpensesChart = asyncHandler(async (req, res) => {
  const data = await reportService.getChartData("expenses", req.query);
  return res.status(200).json({
    success: true,
    message: "Chart data fetched successfully.",
    data
  });
});

export const getTripsChart = asyncHandler(async (req, res) => {
  const data = await reportService.getChartData("trips", req.query);
  return res.status(200).json({
    success: true,
    message: "Chart data fetched successfully.",
    data
  });
});

export const getMaintenanceChart = asyncHandler(async (req, res) => {
  const data = await reportService.getChartData("maintenance", req.query);
  return res.status(200).json({
    success: true,
    message: "Chart data fetched successfully.",
    data
  });
});

export const getFleetChart = asyncHandler(async (req, res) => {
  const data = await reportService.getChartData("fleet", req.query);
  return res.status(200).json({
    success: true,
    message: "Chart data fetched successfully.",
    data
  });
});

// Top List controllers
export const getTopList = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const data = await reportService.getTopLists(type, req.query);
  return res.status(200).json({
    success: true,
    message: "Top list data fetched successfully.",
    data
  });
});
