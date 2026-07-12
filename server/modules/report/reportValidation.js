import { ApiError } from "../../utils/ApiError.js";

export const validateReportFilters = (req, res, next) => {
  const {
    from,
    to,
    page,
    limit,
    sortBy,
    order,
    groupBy,
    vehicleId,
    driverId,
    tripId
  } = req.query;

  // 1. Pagination validations
  if (page !== undefined) {
    const p = parseInt(page, 10);
    if (isNaN(p) || p <= 0) {
      throw new ApiError(400, "Page must be a positive integer", "VALIDATION_ERROR");
    }
  }

  if (limit !== undefined) {
    const l = parseInt(limit, 10);
    if (isNaN(l) || l <= 0) {
      throw new ApiError(400, "Limit must be a positive integer", "VALIDATION_ERROR");
    }
  }

  // 2. Date range validations
  if (from !== undefined && from.trim() !== "") {
    if (isNaN(Date.parse(from))) {
      throw new ApiError(400, "Invalid 'from' date format", "VALIDATION_ERROR");
    }
  }

  if (to !== undefined && to.trim() !== "") {
    if (isNaN(Date.parse(to))) {
      throw new ApiError(400, "Invalid 'to' date format", "VALIDATION_ERROR");
    }
  }

  if (from && to && from.trim() !== "" && to.trim() !== "") {
    if (new Date(from) > new Date(to)) {
      throw new ApiError(400, "'from' date cannot be after 'to' date", "VALIDATION_ERROR");
    }
  }

  // 3. Sorting validations
  if (sortBy !== undefined) {
    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "date",
      "cost",
      "amount",
      "distance",
      "fuel",
      "driver",
      "vehicle"
    ];
    if (!allowedSortFields.includes(sortBy)) {
      throw new ApiError(
        400,
        `Invalid sort field. Allowed fields: ${allowedSortFields.join(", ")}`,
        "VALIDATION_ERROR"
      );
    }
  }

  if (order !== undefined) {
    const allowedOrder = ["asc", "desc", "ASC", "DESC"];
    if (!allowedOrder.includes(order)) {
      throw new ApiError(400, "Order must be 'asc' or 'desc'", "VALIDATION_ERROR");
    }
  }

  // 4. GroupBy validations
  if (groupBy !== undefined) {
    const allowedGroupings = [
      "daily", "day",
      "weekly", "week",
      "monthly", "month",
      "quarterly", "quarter",
      "yearly", "year"
    ];
    if (!allowedGroupings.includes(groupBy.toLowerCase())) {
      throw new ApiError(
        400,
        `Invalid groupBy. Allowed groupings: ${allowedGroupings.join(", ")}`,
        "VALIDATION_ERROR"
      );
    }
  }

  // 5. UUID reference checks
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (vehicleId && !uuidRegex.test(vehicleId)) {
    throw new ApiError(400, "vehicleId must be a valid UUID", "VALIDATION_ERROR");
  }
  if (driverId && !uuidRegex.test(driverId)) {
    throw new ApiError(400, "driverId must be a valid UUID", "VALIDATION_ERROR");
  }
  if (tripId && !uuidRegex.test(tripId)) {
    throw new ApiError(400, "tripId must be a valid UUID", "VALIDATION_ERROR");
  }

  next();
};
