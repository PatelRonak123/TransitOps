import { db } from "../../config/dbConfig.js";
import { vehicles } from "./vehicleModel.js";
import { trips } from "../trip/tripModel.js";
import { maintenanceLogs } from "../maintenance/maintenanceModel.js";
import { eq, and, or, ilike, desc, asc, isNull, count, gte, sql } from "drizzle-orm";
import { ApiError } from "../../utils/ApiError.js";

export const vehicleService = {
  createVehicle: async (vehicleData) => {
    if (!vehicleData || typeof vehicleData !== "object") {
      throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
    }

    const regNum = vehicleData.registration_number.trim().toUpperCase();
    const existing = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.registrationNumber, regNum))
      .limit(1);

    if (existing.length > 0) {
      throw new ApiError(409, "Vehicle registration already exists", "CONFLICT");
    }

    const dbPayload = {
      registrationNumber: regNum,
      vehicleName: vehicleData.vehicle_name,
      vehicleModel: vehicleData.vehicle_model || null,
      vehicleType: vehicleData.vehicle_type,
      maxLoadCapacity: String(vehicleData.max_load_capacity),
      odometer: String(vehicleData.odometer || 0),
      acquisitionCost: String(vehicleData.acquisition_cost),
      status: vehicleData.status || "Available",
      region: vehicleData.region || null,
      notes: vehicleData.notes || null,
    };

    const result = await db
      .insert(vehicles)
      .values(dbPayload)
      .returning();

    return result[0];
  },

  getVehicles: async (query) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { sortBy, order, search, status, vehicle_type, region } = query;

    const searchConditions = [];
    if (search) {
      const searchStr = `%${search.trim()}%`;
      searchConditions.push(
        or(
          ilike(vehicles.registrationNumber, searchStr),
          ilike(vehicles.vehicleName, searchStr),
          ilike(vehicles.vehicleModel, searchStr),
          ilike(vehicles.region, searchStr)
        )
      );
    }

    const filterConditions = [];
    if (status) {
      filterConditions.push(eq(vehicles.status, status));
    }
    if (vehicle_type) {
      filterConditions.push(eq(vehicles.vehicleType, vehicle_type));
    }
    if (region) {
      filterConditions.push(eq(vehicles.region, region));
    }

    const conditions = and(
      isNull(vehicles.deletedAt),
      ...searchConditions,
      ...filterConditions
    );

    const countResult = await db
      .select({ count: count() })
      .from(vehicles)
      .where(conditions);
    const total = parseInt(countResult[0]?.count || 0, 10);
    const totalPages = Math.ceil(total / limit);

    const sortFieldMap = {
      registration_number: vehicles.registrationNumber,
      vehicle_name: vehicles.vehicleName,
      created_at: vehicles.createdAt,
      odometer: vehicles.odometer,
      capacity: vehicles.maxLoadCapacity,
    };
    const sortField = sortFieldMap[sortBy] || vehicles.createdAt;
    const sortOrder = order === "asc" ? asc(sortField) : desc(sortField);

    const data = await db
      .select()
      .from(vehicles)
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

  getVehicleById: async (id) => {
    const result = await db
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.id, id), isNull(vehicles.deletedAt)))
      .limit(1);

    if (result.length === 0) {
      throw new ApiError(404, "Vehicle not found", "VEHICLE_NOT_FOUND");
    }
    return result[0];
  },

  updateVehicle: async (id, updateData) => {
    if (!updateData || typeof updateData !== "object") {
      throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
    }

    const result = await db
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.id, id), isNull(vehicles.deletedAt)))
      .limit(1);

    if (result.length === 0) {
      throw new ApiError(404, "Vehicle not found", "VEHICLE_NOT_FOUND");
    }
    const current = result[0];

    if (current.status === "Retired") {
      const updateKeys = Object.keys(updateData);
      const invalidKeys = updateKeys.filter(k => k !== "notes" && updateData[k] !== undefined);
      if (invalidKeys.length > 0) {
        throw new ApiError(400, "Retired vehicles cannot be edited except notes", "VALIDATION_ERROR");
      }
    }

    if (updateData.registration_number !== undefined) {
      const reg = updateData.registration_number.trim().toUpperCase();
      if (reg !== current.registrationNumber) {
        throw new ApiError(400, "Registration number cannot be changed after vehicle is created", "VALIDATION_ERROR");
      }
    }

    if (updateData.odometer !== undefined) {
      const newOdo = Number(updateData.odometer);
      const currentOdo = Number(current.odometer);
      if (newOdo < currentOdo) {
        throw new ApiError(400, "New odometer cannot be less than existing odometer", "VALIDATION_ERROR");
      }
    }

    if (current.status === "Retired" && updateData.status !== undefined && updateData.status !== "Retired") {
      throw new ApiError(400, "Retired vehicle status cannot be changed", "VALIDATION_ERROR");
    }

    const dbPayload = {};
    if (updateData.vehicle_name !== undefined) dbPayload.vehicleName = updateData.vehicle_name;
    if (updateData.vehicle_model !== undefined) dbPayload.vehicleModel = updateData.vehicle_model || null;
    if (updateData.vehicle_type !== undefined) dbPayload.vehicleType = updateData.vehicle_type;
    if (updateData.max_load_capacity !== undefined) dbPayload.maxLoadCapacity = String(updateData.max_load_capacity);
    if (updateData.odometer !== undefined) dbPayload.odometer = String(updateData.odometer);
    if (updateData.acquisition_cost !== undefined) dbPayload.acquisitionCost = String(updateData.acquisition_cost);
    if (updateData.status !== undefined) dbPayload.status = updateData.status;
    if (updateData.region !== undefined) dbPayload.region = updateData.region || null;
    if (updateData.notes !== undefined) dbPayload.notes = updateData.notes || null;

    dbPayload.updatedAt = new Date();

    const updated = await db
      .update(vehicles)
      .set(dbPayload)
      .where(eq(vehicles.id, id))
      .returning();

    return updated[0];
  },

  deleteVehicle: async (id) => {
    const result = await db
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.id, id), isNull(vehicles.deletedAt)))
      .limit(1);

    if (result.length === 0) {
      throw new ApiError(404, "Vehicle not found", "VEHICLE_NOT_FOUND");
    }
    const current = result[0];

    if (current.status === "On Trip") {
      throw new ApiError(400, "Vehicle currently on trip cannot be deleted", "DELETE_FAILED");
    }

    await db
      .update(vehicles)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(vehicles.id, id));

    return true;
  },

  getAvailableVehicles: async () => {
    const data = await db
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.status, "Available"), isNull(vehicles.deletedAt)));

    return data;
  },

  getVehicleStatistics: async () => {
    const statsResult = await db
      .select({
        status: vehicles.status,
        count: count()
      })
      .from(vehicles)
      .where(isNull(vehicles.deletedAt))
      .groupBy(vehicles.status);

    let totalVehicles = 0;
    let availableVehicles = 0;
    let onTripVehicles = 0;
    let maintenanceVehicles = 0;
    let retiredVehicles = 0;

    for (const row of statsResult) {
      const cnt = parseInt(row.count, 10) || 0;
      totalVehicles += cnt;
      if (row.status === "Available") availableVehicles = cnt;
      else if (row.status === "On Trip") onTripVehicles = cnt;
      else if (row.status === "In Shop") maintenanceVehicles = cnt;
      else if (row.status === "Retired") retiredVehicles = cnt;
    }

    return {
      totalVehicles,
      availableVehicles,
      onTripVehicles,
      maintenanceVehicles,
      retiredVehicles,
    };
  },

  diagnoseVehicle: async (id) => {
    const result = await db
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.id, id), isNull(vehicles.deletedAt)))
      .limit(1);

    if (result.length === 0) {
      throw new ApiError(404, "Vehicle not found", "VEHICLE_NOT_FOUND");
    }

    const vehicle = result[0];

    // 1. Calculate vehicle_age_years from vehicleModel (looking for 4-digit year like "2020")
    const yearMatch = vehicle.vehicleModel?.match(/\b(19|20)\d{2}\b/);
    const modelYear = yearMatch ? parseInt(yearMatch[0], 10) : new Date(vehicle.createdAt).getFullYear();
    const vehicle_age_years = Math.max(1, new Date().getFullYear() - modelYear);

    // 2. Odometer KM
    const odometer_km = Math.round(Number(vehicle.odometer) || 0);

    // 3. Days since last service & previous repairs
    const completedLogs = await db
      .select()
      .from(maintenanceLogs)
      .where(
        and(
          eq(maintenanceLogs.vehicleId, id),
          eq(maintenanceLogs.status, "Completed"),
          isNull(maintenanceLogs.deletedAt)
        )
      )
      .orderBy(desc(maintenanceLogs.completionDate));

    let days_since_last_service = 0;
    if (completedLogs.length > 0) {
      const lastLog = completedLogs[0];
      const lastServiceDate = lastLog.completionDate ? new Date(lastLog.completionDate) : new Date(lastLog.createdAt);
      days_since_last_service = Math.max(0, Math.ceil((new Date() - lastServiceDate) / (1000 * 60 * 60 * 24)));
    } else {
      days_since_last_service = Math.max(0, Math.ceil((new Date() - new Date(vehicle.createdAt)) / (1000 * 60 * 60 * 24)));
    }

    const previous_repairs = completedLogs.length;

    // 4. Sum maintenance cost for the last 365 days
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);

    const pastYearMaintenance = await db
      .select({ cost: maintenanceLogs.actualCost })
      .from(maintenanceLogs)
      .where(
        and(
          eq(maintenanceLogs.vehicleId, id),
          eq(maintenanceLogs.status, "Completed"),
          isNull(maintenanceLogs.deletedAt),
          gte(maintenanceLogs.createdAt, oneYearAgo)
        )
      );
    const maintenance_cost_last_year = pastYearMaintenance.reduce((sum, log) => sum + (Number(log.cost) || 0), 0);

    // 5. Avg daily distance & estimated fuel efficiency from trips
    const completedTrips = await db
      .select({
        distance: sql`COALESCE(${trips.actualDistance}, ${trips.plannedDistance}, 0)`,
        fuel: trips.fuelConsumed
      })
      .from(trips)
      .where(
        and(
          eq(trips.vehicleId, id),
          eq(trips.status, "Completed"),
          isNull(trips.deletedAt)
        )
      );

    let avg_daily_distance_km = 120; // Default fallback
    if (completedTrips.length > 0) {
      const totalDist = completedTrips.reduce((sum, t) => sum + (Number(t.distance) || 0), 0);
      avg_daily_distance_km = Math.round(totalDist / completedTrips.length) || 120;
    }

    let fuel_efficiency_kmpl = 8.5; // Default fallback
    const validFuelTrips = completedTrips.filter(t => Number(t.fuel) > 0);
    if (validFuelTrips.length > 0) {
      const efficiencies = validFuelTrips.map(t => (Number(t.distance) || 0) / Number(t.fuel));
      const avgEff = efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length;
      fuel_efficiency_kmpl = Number(avgEff.toFixed(2)) || 8.5;
    }

    // Map vehicleType standard values for Python ML model
    let vehicle_type = "Truck";
    if (vehicle.vehicleType) {
      if (vehicle.vehicleType.toLowerCase().includes("pickup")) vehicle_type = "Pickup";
      else if (vehicle.vehicleType.toLowerCase().includes("mini")) vehicle_type = "Mini Truck";
    }

    const payload = {
      vehicle_type,
      vehicle_age_years,
      odometer_km,
      days_since_last_service,
      previous_repairs,
      avg_daily_distance_km,
      fuel_efficiency_kmpl,
      maintenance_cost_last_year
    };

    try {
      // Call local FastAPI endpoint
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return {
        success: true,
        features: payload,
        prediction: data
      };
    } catch (err) {
      console.error("AI service prediction call failed:", err.message);
      // Fallback prediction mock in case FastAPI is offline
      return {
        success: false,
        features: payload,
        error: "AI microservice offline. Displaying heuristic estimate.",
        prediction: {
          maintenance_risk: odometer_km > 100000 || days_since_last_service > 180 ? "High" : "Low",
          confidence: 85.0,
          service_in_days: odometer_km > 100000 || days_since_last_service > 180 ? 10 : 50
        }
      };
    }
  },
};
