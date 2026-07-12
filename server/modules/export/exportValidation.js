import { validateReportFilters } from "../report/reportValidation.js";

export const validateExportFilters = (req, res, next) => {
  // Call the report validator first
  validateReportFilters(req, res, () => {
    // Override page and limit to fetch all matching entries for the export
    req.query.limit = 100000;
    req.query.page = 1;
    next();
  });
};
