import { asyncHandler } from "../../utils/asyncHandler.js";
import { dashboardService } from "./dashboardService.js";

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const data = await dashboardService.getDashboardSummary(from, to);
  return res.status(200).json({
    success: true,
    ...data
  });
});

export const getFleetKPIs = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const data = await dashboardService.getFleetKPIs(from, to);
  return res.status(200).json({
    success: true,
    data
  });
});

export const getTripKPIs = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const data = await dashboardService.getTripKPIs(from, to);
  return res.status(200).json({
    success: true,
    data
  });
});

export const getFinancialKPIs = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const data = await dashboardService.getFinancialKPIs(from, to);
  return res.status(200).json({
    success: true,
    data
  });
});

export const getChartData = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const data = await dashboardService.getChartData(from, to);
  return res.status(200).json({
    success: true,
    data
  });
});

export const getTopVehicles = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const data = await dashboardService.getTopVehicles(from, to);
  return res.status(200).json({
    success: true,
    data
  });
});

export const getAlerts = asyncHandler(async (req, res) => {
  const data = await dashboardService.getAlerts();
  return res.status(200).json({
    success: true,
    data
  });
});

export const searchSystem = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const data = await dashboardService.searchSystem(q);
  return res.status(200).json({
    success: true,
    data
  });
});
