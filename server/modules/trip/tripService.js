import { db } from "../../config/dbConfig.js";
import { trips } from "./tripModel.js";
import { vehicles } from "../vehicle/vehicleModel.js";
import { drivers } from "../driver/driverModel.js";
import { users } from "../../db/Schema/schema.js";
import { eq, and, or, ilike, desc, asc, isNull, count, gte, lte, sql } from "drizzle-orm";
import { ApiError } from "../../utils/ApiError.js";

export const tripService = {
  createTrip: async (tripData, userId) => {
    if (!tripData || typeof tripData !== "object") {
      throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
    }

    const vehicle = await db
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.id, tripData.vehicle_id), isNull(vehicles.deletedAt)))
      .limit(1);

    if (vehicle.length === 0) {
      throw new ApiError(404, "Vehicle not found", "VEHICLE_NOT_FOUND");
    }

    const driver = await db
      .select()
      .from(drivers)
      .where(and(eq(drivers.id, tripData.driver_id), isNull(drivers.deletedAt)))
      .limit(1);

    if (driver.length === 0) {
      throw new ApiError(404, "Driver not found", "DRIVER_NOT_FOUND");
    }

    const countResult = await db.select({ count: count() }).from(trips);
    const total = parseInt(countResult[0]?.count || 0, 10);
    const tripNumber = `TRIP-${String(total + 1).padStart(6, '0')}`;

    const dbPayload = {
      tripNumber,
      vehicleId: tripData.vehicle_id,
      driverId: tripData.driver_id,
      source: tripData.source,
      destination: tripData.destination,
      cargoWeight: String(tripData.cargo_weight),
      plannedDistance: tripData.planned_distance ? String(tripData.planned_distance) : null,
      revenue: tripData.revenue ? String(tripData.revenue) : null,
      remarks: tripData.remarks || null,
      status: "Draft",
      createdBy: userId,
    };

    const result = await db
      .insert(trips)
      .values(dbPayload)
      .returning();

    return result[0];
  },

  getTrips: async (query) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const {
      sortBy,
      order,
      search,
      status,
      vehicle_id,
      driver_id,
      created_by,
      dispatch_date,
      start_date,
      end_date
    } = query;

    const searchConditions = [];
    if (search) {
      const searchStr = `%${search.trim()}%`;
      searchConditions.push(
        or(
          ilike(trips.tripNumber, searchStr),
          ilike(trips.source, searchStr),
          ilike(trips.destination, searchStr),
          ilike(vehicles.vehicleName, searchStr),
          ilike(vehicles.registrationNumber, searchStr),
          ilike(drivers.fullName, searchStr)
        )
      );
    }

    const filterConditions = [];
    if (status) {
      filterConditions.push(eq(trips.status, status));
    }
    if (vehicle_id) {
      filterConditions.push(eq(trips.vehicleId, vehicle_id));
    }
    if (driver_id) {
      filterConditions.push(eq(trips.driverId, driver_id));
    }
    if (created_by) {
      filterConditions.push(eq(trips.createdBy, created_by));
    }
    if (dispatch_date) {
      filterConditions.push(sql`date(${trips.dispatchDate}) = ${dispatch_date}`);
    }
    if (start_date) {
      filterConditions.push(gte(trips.dispatchDate, new Date(start_date)));
    }
    if (end_date) {
      filterConditions.push(lte(trips.dispatchDate, new Date(end_date)));
    }

    const conditions = and(
      isNull(trips.deletedAt),
      ...searchConditions,
      ...filterConditions
    );

    const countResult = await db
      .select({ count: count() })
      .from(trips)
      .innerJoin(vehicles, eq(trips.vehicleId, vehicles.id))
      .innerJoin(drivers, eq(trips.driverId, drivers.id))
      .where(conditions);
    const total = parseInt(countResult[0]?.count || 0, 10);
    const totalPages = Math.ceil(total / limit);

    const sortFieldMap = {
      dispatch_date: trips.dispatchDate,
      created_at: trips.createdAt,
      trip_number: trips.tripNumber,
      status: trips.status,
      source: trips.source,
      destination: trips.destination,
    };
    const sortField = sortFieldMap[sortBy] || trips.createdAt;
    const sortOrder = order === "asc" ? asc(sortField) : desc(sortField);

    const data = await db
      .select({
        trip: trips,
        vehicle: vehicles,
        driver: drivers,
        creator: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        }
      })
      .from(trips)
      .innerJoin(vehicles, eq(trips.vehicleId, vehicles.id))
      .innerJoin(drivers, eq(trips.driverId, drivers.id))
      .innerJoin(users, eq(trips.createdBy, users.id))
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

  getTripById: async (id) => {
    const result = await db
      .select({
        trip: trips,
        vehicle: vehicles,
        driver: drivers,
        creator: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        }
      })
      .from(trips)
      .innerJoin(vehicles, eq(trips.vehicleId, vehicles.id))
      .innerJoin(drivers, eq(trips.driverId, drivers.id))
      .innerJoin(users, eq(trips.createdBy, users.id))
      .where(and(eq(trips.id, id), isNull(trips.deletedAt)))
      .limit(1);

    if (result.length === 0) {
      throw new ApiError(404, "Trip not found", "TRIP_NOT_FOUND");
    }
    return result[0];
  },

  updateTrip: async (id, updateData) => {
    if (!updateData || typeof updateData !== "object") {
      throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
    }

    const current = await db
      .select()
      .from(trips)
      .where(and(eq(trips.id, id), isNull(trips.deletedAt)))
      .limit(1);

    if (current.length === 0) {
      throw new ApiError(404, "Trip not found", "TRIP_NOT_FOUND");
    }

    const trip = current[0];

    if (trip.status !== "Draft") {
      throw new ApiError(400, "Trips can only be updated when they are in Draft status", "VALIDATION_ERROR");
    }

    const dbPayload = {};
    if (updateData.vehicle_id !== undefined) {
      const vehicle = await db
        .select()
        .from(vehicles)
        .where(and(eq(vehicles.id, updateData.vehicle_id), isNull(vehicles.deletedAt)))
        .limit(1);
      if (vehicle.length === 0) {
        throw new ApiError(404, "Vehicle not found", "VEHICLE_NOT_FOUND");
      }
      dbPayload.vehicleId = updateData.vehicle_id;
    }

    if (updateData.driver_id !== undefined) {
      const driver = await db
        .select()
        .from(drivers)
        .where(and(eq(drivers.id, updateData.driver_id), isNull(drivers.deletedAt)))
        .limit(1);
      if (driver.length === 0) {
        throw new ApiError(404, "Driver not found", "DRIVER_NOT_FOUND");
      }
      dbPayload.driverId = updateData.driver_id;
    }

    if (updateData.source !== undefined) dbPayload.source = updateData.source;
    if (updateData.destination !== undefined) dbPayload.destination = updateData.destination;
    if (updateData.cargo_weight !== undefined) dbPayload.cargoWeight = String(updateData.cargo_weight);
    if (updateData.planned_distance !== undefined) dbPayload.plannedDistance = String(updateData.planned_distance);
    if (updateData.revenue !== undefined) dbPayload.revenue = String(updateData.revenue);
    if (updateData.remarks !== undefined) dbPayload.remarks = updateData.remarks;

    dbPayload.updatedAt = new Date();

    const updated = await db
      .update(trips)
      .set(dbPayload)
      .where(eq(trips.id, id))
      .returning();

    return updated[0];
  },

  deleteTrip: async (id) => {
    const current = await db
      .select()
      .from(trips)
      .where(and(eq(trips.id, id), isNull(trips.deletedAt)))
      .limit(1);

    if (current.length === 0) {
      throw new ApiError(404, "Trip not found", "TRIP_NOT_FOUND");
    }

    const trip = current[0];

    if (trip.status === "Dispatched" || trip.status === "Completed") {
      throw new ApiError(400, "Cannot delete dispatched or completed trips", "DELETE_FAILED");
    }

    await db
      .update(trips)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(trips.id, id));

    return true;
  },

  dispatchTrip: async (id) => {
    return await db.transaction(async (tx) => {
      const current = await tx
        .select()
        .from(trips)
        .where(and(eq(trips.id, id), isNull(trips.deletedAt)))
        .limit(1);

      if (current.length === 0) {
        throw new ApiError(404, "Trip not found", "TRIP_NOT_FOUND");
      }
      const trip = current[0];

      if (trip.status !== "Draft") {
        throw new ApiError(400, "Only trips in Draft status can be dispatched", "VALIDATION_ERROR");
      }

      const vehicle = await tx
        .select()
        .from(vehicles)
        .where(and(eq(vehicles.id, trip.vehicleId), isNull(vehicles.deletedAt)))
        .limit(1);

      if (vehicle.length === 0) {
        throw new ApiError(404, "Vehicle not found", "VEHICLE_NOT_FOUND");
      }
      const v = vehicle[0];

      if (v.status !== "Available") {
        throw new ApiError(400, `Vehicle is not available (Status: ${v.status})`, "VALIDATION_ERROR");
      }

      const driver = await tx
        .select()
        .from(drivers)
        .where(and(eq(drivers.id, trip.driverId), isNull(drivers.deletedAt)))
        .limit(1);

      if (driver.length === 0) {
        throw new ApiError(404, "Driver not found", "DRIVER_NOT_FOUND");
      }
      const d = driver[0];

      if (d.status !== "Available") {
        throw new ApiError(400, `Driver is not available (Status: ${d.status})`, "VALIDATION_ERROR");
      }

      const todayStr = new Date().toISOString().split("T")[0];
      if (d.licenseExpiryDate < todayStr) {
        throw new ApiError(400, "Driver license has expired", "VALIDATION_ERROR");
      }

      const cargoWeightNum = Number(trip.cargoWeight);
      const maxCapNum = Number(v.maxLoadCapacity);
      if (cargoWeightNum > maxCapNum) {
        throw new ApiError(400, "Cargo exceeds vehicle capacity", "VALIDATION_ERROR");
      }

      await tx
        .update(vehicles)
        .set({ status: "On Trip", updatedAt: new Date() })
        .where(eq(vehicles.id, v.id));

      await tx
        .update(drivers)
        .set({ status: "On Trip", updatedAt: new Date() })
        .where(eq(drivers.id, d.id));

      const updated = await tx
        .update(trips)
        .set({
          status: "Dispatched",
          dispatchDate: new Date(),
          startOdometer: v.odometer,
          updatedAt: new Date()
        })
        .where(eq(trips.id, id))
        .returning();

      return updated[0];
    });
  },

  completeTrip: async (id, completeData) => {
    return await db.transaction(async (tx) => {
      const current = await tx
        .select()
        .from(trips)
        .where(and(eq(trips.id, id), isNull(trips.deletedAt)))
        .limit(1);

      if (current.length === 0) {
        throw new ApiError(404, "Trip not found", "TRIP_NOT_FOUND");
      }
      const trip = current[0];

      if (trip.status !== "Dispatched") {
        throw new ApiError(400, "Only dispatched trips can be completed", "VALIDATION_ERROR");
      }

      const endOdo = Number(completeData.end_odometer);
      const startOdo = Number(trip.startOdometer || 0);

      if (endOdo < startOdo) {
        throw new ApiError(400, "End odometer cannot be less than start odometer", "VALIDATION_ERROR");
      }

      const updated = await tx
        .update(trips)
        .set({
          status: "Completed",
          endOdometer: String(endOdo),
          actualDistance: String(completeData.actual_distance),
          fuelConsumed: String(completeData.fuel_consumed),
          completionDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(trips.id, id))
        .returning();

      await tx
        .update(vehicles)
        .set({
          status: "Available",
          odometer: String(endOdo),
          updatedAt: new Date()
        })
        .where(eq(vehicles.id, trip.vehicleId));

      await tx
        .update(drivers)
        .set({
          status: "Available",
          updatedAt: new Date()
        })
        .where(eq(drivers.id, trip.driverId));

      return updated[0];
    });
  },

  cancelTrip: async (id) => {
    return await db.transaction(async (tx) => {
      const current = await tx
        .select()
        .from(trips)
        .where(and(eq(trips.id, id), isNull(trips.deletedAt)))
        .limit(1);

      if (current.length === 0) {
        throw new ApiError(404, "Trip not found", "TRIP_NOT_FOUND");
      }
      const trip = current[0];

      if (trip.status !== "Draft" && trip.status !== "Dispatched") {
        throw new ApiError(400, "Only draft or dispatched trips can be cancelled", "VALIDATION_ERROR");
      }

      const updated = await tx
        .update(trips)
        .set({
          status: "Cancelled",
          updatedAt: new Date()
        })
        .where(eq(trips.id, id))
        .returning();

      await tx
        .update(vehicles)
        .set({
          status: "Available",
          updatedAt: new Date()
        })
        .where(eq(vehicles.id, trip.vehicleId));

      await tx
        .update(drivers)
        .set({
          status: "Available",
          updatedAt: new Date()
        })
        .where(eq(drivers.id, trip.driverId));

      return updated[0];
    });
  },

  getTripStatistics: async () => {
    const statsResult = await db
      .select({
        status: trips.status,
        count: count()
      })
      .from(trips)
      .where(isNull(trips.deletedAt))
      .groupBy(trips.status);

    let totalTrips = 0;
    let draftTrips = 0;
    let activeTrips = 0;
    let completedTrips = 0;
    let cancelledTrips = 0;

    for (const row of statsResult) {
      const cnt = parseInt(row.count, 10) || 0;
      totalTrips += cnt;
      if (row.status === "Draft") draftTrips = cnt;
      else if (row.status === "Dispatched") activeTrips = cnt;
      else if (row.status === "Completed") completedTrips = cnt;
      else if (row.status === "Cancelled") cancelledTrips = cnt;
    }

    return {
      totalTrips,
      draftTrips,
      activeTrips,
      completedTrips,
      cancelledTrips,
    };
  },
};
