import { db } from "../../config/dbConfig.js";
import { fuelLogs } from "./fuelModel.js";
import { vehicles } from "../vehicle/vehicleModel.js";
import { trips } from "../trip/tripModel.js";
import { users } from "../../db/Schema/schema.js";
import { eq, and, or, ilike, desc, asc, isNull, count, sql, gte, lte } from "drizzle-orm";
import { ApiError } from "../../utils/ApiError.js";

export const fuelService = {
  createFuelLog: async (data, userId) => {
    return await db.transaction(async (tx) => {
      const tripResult = await tx
        .select()
        .from(trips)
        .where(and(eq(trips.id, data.trip_id), isNull(trips.deletedAt)))
        .limit(1);

      if (tripResult.length === 0) {
        throw new ApiError(404, "Trip not found", "TRIP_NOT_FOUND");
      }
      const trip = tripResult[0];

      if (trip.status !== "Completed") {
        throw new ApiError(400, "Fuel can only be logged for completed trips", "VALIDATION_ERROR");
      }

      const vehicleResult = await tx
        .select()
        .from(vehicles)
        .where(and(eq(vehicles.id, data.vehicle_id), isNull(vehicles.deletedAt)))
        .limit(1);

      if (vehicleResult.length === 0) {
        throw new ApiError(404, "Vehicle not found", "VEHICLE_NOT_FOUND");
      }
      const vehicle = vehicleResult[0];

      if (trip.vehicleId !== vehicle.id) {
        throw new ApiError(400, "Trip does not belong to the specified vehicle", "VALIDATION_ERROR");
      }

      const existingLogs = await tx
        .select()
        .from(fuelLogs)
        .where(and(eq(fuelLogs.tripId, trip.id), isNull(fuelLogs.deletedAt)))
        .limit(1);

      if (existingLogs.length > 0) {
        throw new ApiError(409, "Fuel log already exists for this trip", "CONFLICT");
      }

      const odoReading = Number(data.odometer_reading);
      const vehicleOdo = Number(vehicle.odometer);
      if (odoReading < vehicleOdo) {
        throw new ApiError(400, "Fuel log odometer reading must be greater than or equal to vehicle current odometer", "VALIDATION_ERROR");
      }

      const countResult = await tx.select({ count: count() }).from(fuelLogs);
      const total = parseInt(countResult[0]?.count || 0, 10);
      const fuelLogNumber = `FUEL-${String(total + 1).padStart(6, '0')}`;

      const liters = Number(data.liters);
      const price = Number(data.price_per_liter);
      const totalCost = liters * price;

      const actualDist = Number(trip.actualDistance || 0);
      let fuelEfficiency = null;
      if (liters > 0) {
        fuelEfficiency = actualDist / liters;
      }

      const dbPayload = {
        fuelLogNumber,
        tripId: data.trip_id,
        vehicleId: data.vehicle_id,
        fuelStation: data.fuel_station || null,
        fuelType: data.fuel_type,
        liters: String(liters),
        pricePerLiter: String(price),
        totalCost: String(totalCost),
        odometerReading: String(odoReading),
        fuelEfficiency: fuelEfficiency !== null ? String(fuelEfficiency) : null,
        fuelDate: data.fuel_date,
        remarks: data.remarks || null,
        createdBy: userId,
      };

      const result = await tx
        .insert(fuelLogs)
        .values(dbPayload)
        .returning();

      return result[0];
    });
  },

  getFuelLogs: async (query) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const {
      sortBy,
      order,
      search,
      vehicle_id,
      trip_id,
      fuel_type,
      fuel_station,
      start_date,
      end_date
    } = query;

    const searchConditions = [];
    if (search) {
      const searchStr = `%${search.trim()}%`;
      searchConditions.push(
        or(
          ilike(fuelLogs.fuelLogNumber, searchStr),
          ilike(fuelLogs.fuelStation, searchStr),
          ilike(vehicles.registrationNumber, searchStr),
          ilike(vehicles.vehicleName, searchStr),
          ilike(trips.tripNumber, searchStr)
        )
      );
    }

    const filterConditions = [];
    if (vehicle_id) filterConditions.push(eq(fuelLogs.vehicleId, vehicle_id));
    if (trip_id) filterConditions.push(eq(fuelLogs.tripId, trip_id));
    if (fuel_type) filterConditions.push(eq(fuelLogs.fuelType, fuel_type));
    if (fuel_station) filterConditions.push(eq(fuelLogs.fuelStation, fuel_station));
    if (start_date) filterConditions.push(gte(fuelLogs.fuelDate, start_date));
    if (end_date) filterConditions.push(lte(fuelLogs.fuelDate, end_date));

    const conditions = and(
      isNull(fuelLogs.deletedAt),
      ...searchConditions,
      ...filterConditions
    );

    const countResult = await db
      .select({ count: count() })
      .from(fuelLogs)
      .innerJoin(vehicles, eq(fuelLogs.vehicleId, vehicles.id))
      .innerJoin(trips, eq(fuelLogs.tripId, trips.id))
      .where(conditions);
    const total = parseInt(countResult[0]?.count || 0, 10);
    const totalPages = Math.ceil(total / limit);

    const sortFieldMap = {
      fuel_date: fuelLogs.fuelDate,
      created_date: fuelLogs.createdAt,
      fuel_cost: fuelLogs.totalCost,
      fuel_quantity: fuelLogs.liters,
      fuel_efficiency: fuelLogs.fuelEfficiency,
    };
    const sortField = sortFieldMap[sortBy] || fuelLogs.createdAt;
    const sortOrder = order === "asc" ? asc(sortField) : desc(sortField);

    const data = await db
      .select({
        fuelLog: fuelLogs,
        vehicle: vehicles,
        trip: trips,
        creator: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        }
      })
      .from(fuelLogs)
      .innerJoin(vehicles, eq(fuelLogs.vehicleId, vehicles.id))
      .innerJoin(trips, eq(fuelLogs.tripId, trips.id))
      .innerJoin(users, eq(fuelLogs.createdBy, users.id))
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

  getFuelLogById: async (id) => {
    const result = await db
      .select({
        fuelLog: fuelLogs,
        vehicle: vehicles,
        trip: trips,
        creator: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        }
      })
      .from(fuelLogs)
      .innerJoin(vehicles, eq(fuelLogs.vehicleId, vehicles.id))
      .innerJoin(trips, eq(fuelLogs.tripId, trips.id))
      .innerJoin(users, eq(fuelLogs.createdBy, users.id))
      .where(and(eq(fuelLogs.id, id), isNull(fuelLogs.deletedAt)))
      .limit(1);

    if (result.length === 0) {
      throw new ApiError(404, "Fuel log not found", "FUEL_LOG_NOT_FOUND");
    }
    return result[0];
  },

  updateFuelLog: async (id, updateData) => {
    const current = await db
      .select()
      .from(fuelLogs)
      .where(and(eq(fuelLogs.id, id), isNull(fuelLogs.deletedAt)))
      .limit(1);

    if (current.length === 0) {
      throw new ApiError(404, "Fuel log not found", "FUEL_LOG_NOT_FOUND");
    }
    const log = current[0];

    if (updateData.trip_id !== undefined && updateData.trip_id !== log.tripId) {
      throw new ApiError(400, "Trip ID cannot be modified on fuel logs", "VALIDATION_ERROR");
    }
    if (updateData.vehicle_id !== undefined && updateData.vehicle_id !== log.vehicleId) {
      throw new ApiError(400, "Vehicle ID cannot be modified on fuel logs", "VALIDATION_ERROR");
    }
    if (updateData.fuel_log_number !== undefined && updateData.fuel_log_number !== log.fuelLogNumber) {
      throw new ApiError(400, "Fuel log number cannot be modified", "VALIDATION_ERROR");
    }

    const dbPayload = {};
    if (updateData.fuel_station !== undefined) dbPayload.fuelStation = updateData.fuel_station || null;
    if (updateData.fuel_type !== undefined) dbPayload.fuelType = updateData.fuel_type;
    if (updateData.fuel_date !== undefined) dbPayload.fuelDate = updateData.fuel_date;
    if (updateData.remarks !== undefined) dbPayload.remarks = updateData.remarks || null;

    let newLiters = log.liters;
    let newPrice = log.pricePerLiter;
    let calculateCost = false;

    if (updateData.liters !== undefined) {
      newLiters = String(updateData.liters);
      dbPayload.liters = newLiters;
      calculateCost = true;
    }
    if (updateData.price_per_liter !== undefined) {
      newPrice = String(updateData.price_per_liter);
      dbPayload.pricePerLiter = newPrice;
      calculateCost = true;
    }

    if (calculateCost) {
      const totalCost = Number(newLiters) * Number(newPrice);
      dbPayload.totalCost = String(totalCost);

      const trip = (await db.select().from(trips).where(eq(trips.id, log.tripId)).limit(1))[0];
      if (trip && Number(newLiters) > 0) {
        const fuelEfficiency = Number(trip.actualDistance || 0) / Number(newLiters);
        dbPayload.fuelEfficiency = String(fuelEfficiency);
      }
    }

    if (updateData.odometer_reading !== undefined) {
      const vehicle = (await db.select().from(vehicles).where(eq(vehicles.id, log.vehicleId)).limit(1))[0];
      if (vehicle && Number(updateData.odometer_reading) < Number(vehicle.odometer)) {
        throw new ApiError(400, "Fuel log odometer reading must be greater than or equal to vehicle current odometer", "VALIDATION_ERROR");
      }
      dbPayload.odometerReading = String(updateData.odometer_reading);
    }

    dbPayload.updatedAt = new Date();

    const updated = await db
      .update(fuelLogs)
      .set(dbPayload)
      .where(eq(fuelLogs.id, id))
      .returning();

    return updated[0];
  },

  deleteFuelLog: async (id) => {
    const current = await db
      .select()
      .from(fuelLogs)
      .where(and(eq(fuelLogs.id, id), isNull(fuelLogs.deletedAt)))
      .limit(1);

    if (current.length === 0) {
      throw new ApiError(404, "Fuel log not found", "FUEL_LOG_NOT_FOUND");
    }

    await db
      .update(fuelLogs)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(fuelLogs.id, id));

    return true;
  },

  getVehicleFuelHistory: async (vehicleId) => {
    const data = await db
      .select({
        fuelLog: fuelLogs,
        trip: trips,
        creator: {
          id: users.id,
          fullName: users.fullName,
        }
      })
      .from(fuelLogs)
      .innerJoin(trips, eq(fuelLogs.tripId, trips.id))
      .innerJoin(users, eq(fuelLogs.createdBy, users.id))
      .where(and(eq(fuelLogs.vehicleId, vehicleId), isNull(fuelLogs.deletedAt)))
      .orderBy(desc(fuelLogs.fuelDate));

    return data;
  },

  getTripFuelLog: async (tripId) => {
    const result = await db
      .select({
        fuelLog: fuelLogs,
        vehicle: vehicles,
        creator: {
          id: users.id,
          fullName: users.fullName,
        }
      })
      .from(fuelLogs)
      .innerJoin(vehicles, eq(fuelLogs.vehicleId, vehicles.id))
      .innerJoin(users, eq(fuelLogs.createdBy, users.id))
      .where(and(eq(fuelLogs.tripId, tripId), isNull(fuelLogs.deletedAt)))
      .limit(1);

    if (result.length === 0) {
      throw new ApiError(404, "Fuel log not found for this trip", "FUEL_LOG_NOT_FOUND");
    }
    return result[0];
  },

  getMonthlyFuelReport: async (month, year) => {
    const startStr = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endStr = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const data = await db
      .select({
        fuelLog: fuelLogs,
        vehicle: vehicles,
        trip: trips,
        creator: {
          id: users.id,
          fullName: users.fullName,
        }
      })
      .from(fuelLogs)
      .innerJoin(vehicles, eq(fuelLogs.vehicleId, vehicles.id))
      .innerJoin(trips, eq(fuelLogs.tripId, trips.id))
      .innerJoin(users, eq(fuelLogs.createdBy, users.id))
      .where(
        and(
          isNull(fuelLogs.deletedAt),
          sql`date(${fuelLogs.fuelDate}) >= ${startStr}`,
          sql`date(${fuelLogs.fuelDate}) <= ${endStr}`
        )
      )
      .orderBy(asc(fuelLogs.fuelDate));

    let totalFuelConsumed = 0;
    let totalFuelCost = 0;
    let totalDistance = 0;

    for (const item of data) {
      totalFuelConsumed += Number(item.fuelLog.liters || 0);
      totalFuelCost += Number(item.fuelLog.totalCost || 0);
      totalDistance += Number(item.trip.actualDistance || 0);
    }

    let averageFuelEfficiency = 0;
    if (totalFuelConsumed > 0) {
      averageFuelEfficiency = totalDistance / totalFuelConsumed;
    }

    return {
      month: parseInt(month, 10),
      year: parseInt(year, 10),
      totalFuelConsumed,
      totalFuelCost,
      averageFuelEfficiency: Number(averageFuelEfficiency.toFixed(2)),
      logs: data,
    };
  },

  getFuelStatistics: async () => {
    const logs = await db
      .select({
        fuelLog: fuelLogs,
        trip: trips,
      })
      .from(fuelLogs)
      .innerJoin(trips, eq(fuelLogs.tripId, trips.id))
      .where(isNull(fuelLogs.deletedAt));

    let totalFuelLogs = logs.length;
    let totalFuelConsumed = 0;
    let totalFuelCost = 0;
    let totalDistance = 0;
    let highestFuelCost = 0;
    let lowestFuelCost = totalFuelLogs > 0 ? Infinity : 0;

    for (const item of logs) {
      const cost = Number(item.fuelLog.totalCost || 0);
      totalFuelConsumed += Number(item.fuelLog.liters || 0);
      totalFuelCost += cost;
      totalDistance += Number(item.trip.actualDistance || 0);

      if (cost > highestFuelCost) highestFuelCost = cost;
      if (cost < lowestFuelCost) lowestFuelCost = cost;
    }

    if (lowestFuelCost === Infinity) lowestFuelCost = 0;

    let averageFuelEfficiency = 0;
    if (totalFuelConsumed > 0) {
      averageFuelEfficiency = totalDistance / totalFuelConsumed;
    }

    let averageCostPerKm = 0;
    if (totalDistance > 0) {
      averageCostPerKm = totalFuelCost / totalDistance;
    }

    return {
      totalFuelLogs,
      totalFuelConsumed,
      totalFuelCost,
      averageFuelEfficiency: Number(averageFuelEfficiency.toFixed(2)),
      averageCostPerKm: Number(averageCostPerKm.toFixed(2)),
      highestFuelCost,
      lowestFuelCost,
    };
  },
};
