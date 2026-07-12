import { db } from "../../config/dbConfig.js";
import { drivers } from "./driverModel.js";
import { eq, and, or, ilike, desc, asc, isNull, count, gte, lte } from "drizzle-orm";
import { ApiError } from "../../utils/ApiError.js";

export const driverService = {
  createDriver: async (driverData) => {
    if (!driverData || typeof driverData !== "object") {
      throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
    }

    const licNum = driverData.license_number.trim().toUpperCase();

    const existing = await db
      .select()
      .from(drivers)
      .where(eq(drivers.licenseNumber, licNum))
      .limit(1);

    if (existing.length > 0) {
      throw new ApiError(409, "Driver license already exists", "CONFLICT");
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const targetStatus = driverData.status || "Available";
    if (targetStatus === "Available" && driverData.license_expiry_date < todayStr) {
      throw new ApiError(400, "Driver with expired license cannot become Available", "VALIDATION_ERROR");
    }

    const dbPayload = {
      fullName: driverData.full_name,
      licenseNumber: licNum,
      licenseCategory: driverData.license_category,
      licenseExpiryDate: driverData.license_expiry_date,
      contactNumber: driverData.contact_number,
      email: driverData.email || null,
      address: driverData.address || null,
      emergencyContact: driverData.emergency_contact || null,
      safetyScore: driverData.safety_score !== undefined ? driverData.safety_score : 100,
      status: targetStatus,
      joiningDate: driverData.joining_date || null,
      notes: driverData.notes || null,
    };

    const result = await db
      .insert(drivers)
      .values(dbPayload)
      .returning();

    return result[0];
  },

  getDrivers: async (query) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { sortBy, order, search, status, license_category } = query;

    const searchConditions = [];
    if (search) {
      const searchStr = `%${search.trim()}%`;
      searchConditions.push(
        or(
          ilike(drivers.fullName, searchStr),
          ilike(drivers.licenseNumber, searchStr),
          ilike(drivers.contactNumber, searchStr),
          ilike(drivers.email, searchStr)
        )
      );
    }

    const filterConditions = [];
    if (status) {
      filterConditions.push(eq(drivers.status, status));
    }
    if (license_category) {
      filterConditions.push(eq(drivers.licenseCategory, license_category));
    }

    const conditions = and(
      isNull(drivers.deletedAt),
      ...searchConditions,
      ...filterConditions
    );

    const countResult = await db
      .select({ count: count() })
      .from(drivers)
      .where(conditions);
    const total = parseInt(countResult[0]?.count || 0, 10);
    const totalPages = Math.ceil(total / limit);

    const sortFieldMap = {
      full_name: drivers.fullName,
      created_at: drivers.createdAt,
      license_expiry_date: drivers.licenseExpiryDate,
      safety_score: drivers.safetyScore,
      status: drivers.status,
    };
    const sortField = sortFieldMap[sortBy] || drivers.createdAt;
    const sortOrder = order === "asc" ? asc(sortField) : desc(sortField);

    const data = await db
      .select()
      .from(drivers)
      .where(conditions)
      .orderBy(sortOrder)
      .limit(limit)
      .offset(offset);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  getDriverById: async (id) => {
    const result = await db
      .select()
      .from(drivers)
      .where(and(eq(drivers.id, id), isNull(drivers.deletedAt)))
      .limit(1);

    if (result.length === 0) {
      throw new ApiError(404, "Driver not found", "DRIVER_NOT_FOUND");
    }
    return result[0];
  },

  updateDriver: async (id, updateData) => {
    if (!updateData || typeof updateData !== "object") {
      throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
    }

    const result = await db
      .select()
      .from(drivers)
      .where(and(eq(drivers.id, id), isNull(drivers.deletedAt)))
      .limit(1);

    if (result.length === 0) {
      throw new ApiError(404, "Driver not found", "DRIVER_NOT_FOUND");
    }
    const current = result[0];

    if (updateData.license_number !== undefined) {
      const lic = updateData.license_number.trim().toUpperCase();
      if (lic !== current.licenseNumber) {
        throw new ApiError(400, "License number cannot be changed after driver is created", "VALIDATION_ERROR");
      }
    }

    if (updateData.safety_score !== undefined) {
      const score = Number(updateData.safety_score);
      if (score < 0 || score > 100) {
        throw new ApiError(400, "Safety score must be between 0 and 100", "VALIDATION_ERROR");
      }
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const targetStatus = updateData.status !== undefined ? updateData.status : current.status;
    const targetExpiry = updateData.license_expiry_date !== undefined ? updateData.license_expiry_date : current.licenseExpiryDate;
    if (targetStatus === "Available" && targetExpiry < todayStr) {
      throw new ApiError(400, "Driver with expired license cannot become Available", "VALIDATION_ERROR");
    }

    const dbPayload = {};
    if (updateData.full_name !== undefined) dbPayload.fullName = updateData.full_name;
    if (updateData.contact_number !== undefined) dbPayload.contactNumber = updateData.contact_number;
    if (updateData.email !== undefined) dbPayload.email = updateData.email || null;
    if (updateData.address !== undefined) dbPayload.address = updateData.address || null;
    if (updateData.status !== undefined) dbPayload.status = updateData.status;
    if (updateData.safety_score !== undefined) dbPayload.safetyScore = updateData.safety_score;
    if (updateData.notes !== undefined) dbPayload.notes = updateData.notes || null;
    if (updateData.emergency_contact !== undefined) dbPayload.emergencyContact = updateData.emergency_contact || null;
    if (updateData.joining_date !== undefined) dbPayload.joiningDate = updateData.joining_date || null;
    if (updateData.license_expiry_date !== undefined) dbPayload.licenseExpiryDate = updateData.license_expiry_date;

    dbPayload.updatedAt = new Date();

    const updated = await db
      .update(drivers)
      .set(dbPayload)
      .where(eq(drivers.id, id))
      .returning();

    return updated[0];
  },

  deleteDriver: async (id) => {
    const result = await db
      .select()
      .from(drivers)
      .where(and(eq(drivers.id, id), isNull(drivers.deletedAt)))
      .limit(1);

    if (result.length === 0) {
      throw new ApiError(404, "Driver not found", "DRIVER_NOT_FOUND");
    }

    await db
      .update(drivers)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(drivers.id, id));

    return true;
  },

  getAvailableDrivers: async () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const data = await db
      .select()
      .from(drivers)
      .where(
        and(
          eq(drivers.status, "Available"),
          gte(drivers.licenseExpiryDate, todayStr),
          isNull(drivers.deletedAt)
        )
      )
      .orderBy(asc(drivers.fullName));

    return data;
  },

  getLicenseExpiryDrivers: async (days) => {
    const limitDays = parseInt(days, 10) || 30;
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + limitDays);

    const todayStr = today.toISOString().split("T")[0];
    const futureStr = future.toISOString().split("T")[0];

    const data = await db
      .select()
      .from(drivers)
      .where(
        and(
          isNull(drivers.deletedAt),
          gte(drivers.licenseExpiryDate, todayStr),
          lte(drivers.licenseExpiryDate, futureStr)
        )
      );

    return data;
  },

  getDriverStatistics: async () => {
    const statsResult = await db
      .select({
        status: drivers.status,
        count: count()
      })
      .from(drivers)
      .where(isNull(drivers.deletedAt))
      .groupBy(drivers.status);

    const todayStr = new Date().toISOString().split("T")[0];
    const expiredResult = await db
      .select({ count: count() })
      .from(drivers)
      .where(
        and(
          isNull(drivers.deletedAt),
          lte(drivers.licenseExpiryDate, todayStr)
        )
      );
    const expiredLicenses = parseInt(expiredResult[0]?.count || 0, 10);

    let totalDrivers = 0;
    let availableDrivers = 0;
    let onTripDrivers = 0;
    let offDutyDrivers = 0;
    let suspendedDrivers = 0;

    for (const row of statsResult) {
      const cnt = parseInt(row.count, 10) || 0;
      totalDrivers += cnt;
      if (row.status === "Available") availableDrivers = cnt;
      else if (row.status === "On Trip") onTripDrivers = cnt;
      else if (row.status === "Off Duty") offDutyDrivers = cnt;
      else if (row.status === "Suspended") suspendedDrivers = cnt;
    }

    return {
      totalDrivers,
      availableDrivers,
      onTripDrivers,
      offDutyDrivers,
      suspendedDrivers,
      expiredLicenses
    };
  },
};
