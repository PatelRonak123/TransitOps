import { db } from "../../config/dbConfig.js";
import { maintenanceLogs } from "./maintenanceModel.js";
import { vehicles } from "../vehicle/vehicleModel.js";
import { users } from "../../db/Schema/schema.js";
import { eq, and, or, ilike, desc, asc, isNull, count, gte, lte } from "drizzle-orm";
import { ApiError } from "../../utils/ApiError.js";

export const maintenanceService = {
  createMaintenance: async (data, userId) => {
    return await db.transaction(async (tx) => {
      const vehicle = await tx
        .select()
        .from(vehicles)
        .where(and(eq(vehicles.id, data.vehicle_id), isNull(vehicles.deletedAt)))
        .limit(1);

      if (vehicle.length === 0) {
        throw new ApiError(404, "Vehicle not found", "VEHICLE_NOT_FOUND");
      }
      const v = vehicle[0];

      if (v.status === "Retired") {
        throw new ApiError(400, "Cannot create maintenance for a retired vehicle", "VALIDATION_ERROR");
      }

      const activeLogs = await tx
        .select()
        .from(maintenanceLogs)
        .where(
          and(
            eq(maintenanceLogs.vehicleId, v.id),
            isNull(maintenanceLogs.deletedAt),
            or(eq(maintenanceLogs.status, "Open"), eq(maintenanceLogs.status, "In Progress"))
          )
        )
        .limit(1);

      if (activeLogs.length > 0) {
        throw new ApiError(409, "Vehicle already has an active maintenance record", "CONFLICT");
      }

      const countResult = await tx.select({ count: count() }).from(maintenanceLogs);
      const total = parseInt(countResult[0]?.count || 0, 10);
      const maintenanceNumber = `MNT-${String(total + 1).padStart(6, '0')}`;

      const dbPayload = {
        maintenanceNumber,
        vehicleId: data.vehicle_id,
        maintenanceType: data.maintenance_type,
        issueTitle: data.issue_title,
        description: data.description || null,
        workshopName: data.workshop_name || null,
        technicianName: data.technician_name || null,
        estimatedCost: data.estimated_cost ? String(data.estimated_cost) : null,
        priority: data.priority,
        status: "Open",
        remarks: data.remarks || null,
        startDate: data.start_date || new Date().toISOString().split("T")[0],
        expectedCompletionDate: data.expected_completion_date || null,
        createdBy: userId,
      };

      const result = await tx
        .insert(maintenanceLogs)
        .values(dbPayload)
        .returning();

      await tx
        .update(vehicles)
        .set({ status: "In Shop", updatedAt: new Date() })
        .where(eq(vehicles.id, v.id));

      return result[0];
    });
  },

  getMaintenances: async (query) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const {
      sortBy,
      order,
      search,
      status,
      priority,
      vehicle_id,
      maintenance_type,
      start_date,
      end_date
    } = query;

    const searchConditions = [];
    if (search) {
      const searchStr = `%${search.trim()}%`;
      searchConditions.push(
        or(
          ilike(maintenanceLogs.maintenanceNumber, searchStr),
          ilike(maintenanceLogs.issueTitle, searchStr),
          ilike(maintenanceLogs.workshopName, searchStr),
          ilike(maintenanceLogs.technicianName, searchStr),
          ilike(vehicles.registrationNumber, searchStr),
          ilike(vehicles.vehicleName, searchStr)
        )
      );
    }

    const filterConditions = [];
    if (status) filterConditions.push(eq(maintenanceLogs.status, status));
    if (priority) filterConditions.push(eq(maintenanceLogs.priority, priority));
    if (maintenance_type) filterConditions.push(eq(maintenanceLogs.maintenanceType, maintenance_type));
    if (vehicle_id) filterConditions.push(eq(maintenanceLogs.vehicleId, vehicle_id));
    if (start_date) filterConditions.push(gte(maintenanceLogs.startDate, start_date));
    if (end_date) filterConditions.push(lte(maintenanceLogs.startDate, end_date));

    const conditions = and(
      isNull(maintenanceLogs.deletedAt),
      ...searchConditions,
      ...filterConditions
    );

    const countResult = await db
      .select({ count: count() })
      .from(maintenanceLogs)
      .innerJoin(vehicles, eq(maintenanceLogs.vehicleId, vehicles.id))
      .where(conditions);
    const total = parseInt(countResult[0]?.count || 0, 10);
    const totalPages = Math.ceil(total / limit);

    const sortFieldMap = {
      created_date: maintenanceLogs.createdAt,
      start_date: maintenanceLogs.startDate,
      completion_date: maintenanceLogs.completionDate,
      estimated_cost: maintenanceLogs.estimatedCost,
      actual_cost: maintenanceLogs.actualCost,
      priority: maintenanceLogs.priority,
      status: maintenanceLogs.status,
    };
    const sortField = sortFieldMap[sortBy] || maintenanceLogs.createdAt;
    const sortOrder = order === "asc" ? asc(sortField) : desc(sortField);

    const data = await db
      .select({
        maintenance: maintenanceLogs,
        vehicle: vehicles,
        creator: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        }
      })
      .from(maintenanceLogs)
      .innerJoin(vehicles, eq(maintenanceLogs.vehicleId, vehicles.id))
      .innerJoin(users, eq(maintenanceLogs.createdBy, users.id))
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

  getMaintenanceById: async (id) => {
    const result = await db
      .select({
        maintenance: maintenanceLogs,
        vehicle: vehicles,
        creator: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        }
      })
      .from(maintenanceLogs)
      .innerJoin(vehicles, eq(maintenanceLogs.vehicleId, vehicles.id))
      .innerJoin(users, eq(maintenanceLogs.createdBy, users.id))
      .where(and(eq(maintenanceLogs.id, id), isNull(maintenanceLogs.deletedAt)))
      .limit(1);

    if (result.length === 0) {
      throw new ApiError(404, "Maintenance record not found", "MAINTENANCE_NOT_FOUND");
    }
    return result[0];
  },

  updateMaintenance: async (id, updateData) => {
    if (!updateData || typeof updateData !== "object") {
      throw new ApiError(400, "Request body is required", "VALIDATION_ERROR");
    }

    const current = await db
      .select()
      .from(maintenanceLogs)
      .where(and(eq(maintenanceLogs.id, id), isNull(maintenanceLogs.deletedAt)))
      .limit(1);

    if (current.length === 0) {
      throw new ApiError(404, "Maintenance record not found", "MAINTENANCE_NOT_FOUND");
    }

    const log = current[0];

    if (log.status === "Completed") {
      throw new ApiError(400, "Completed maintenance records cannot be updated", "VALIDATION_ERROR");
    }

    if (updateData.vehicle_id !== undefined && updateData.vehicle_id !== log.vehicleId) {
      throw new ApiError(400, "Vehicle ID cannot be modified on maintenance records", "VALIDATION_ERROR");
    }
    if (updateData.maintenance_number !== undefined && updateData.maintenance_number !== log.maintenanceNumber) {
      throw new ApiError(400, "Maintenance number cannot be modified", "VALIDATION_ERROR");
    }

    const dbPayload = {};
    if (updateData.issue_title !== undefined) dbPayload.issueTitle = updateData.issue_title;
    if (updateData.description !== undefined) dbPayload.description = updateData.description || null;
    if (updateData.workshop_name !== undefined) dbPayload.workshopName = updateData.workshop_name || null;
    if (updateData.technician_name !== undefined) dbPayload.technicianName = updateData.technician_name || null;
    if (updateData.estimated_cost !== undefined) dbPayload.estimatedCost = String(updateData.estimated_cost);
    if (updateData.actual_cost !== undefined) dbPayload.actualCost = String(updateData.actual_cost);
    if (updateData.priority !== undefined) dbPayload.priority = updateData.priority;
    if (updateData.expected_completion_date !== undefined) dbPayload.expectedCompletionDate = updateData.expected_completion_date || null;
    if (updateData.remarks !== undefined) dbPayload.remarks = updateData.remarks || null;

    dbPayload.updatedAt = new Date();

    const updated = await db
      .update(maintenanceLogs)
      .set(dbPayload)
      .where(eq(maintenanceLogs.id, id))
      .returning();

    return updated[0];
  },

  deleteMaintenance: async (id) => {
    const current = await db
      .select()
      .from(maintenanceLogs)
      .where(and(eq(maintenanceLogs.id, id), isNull(maintenanceLogs.deletedAt)))
      .limit(1);

    if (current.length === 0) {
      throw new ApiError(404, "Maintenance record not found", "MAINTENANCE_NOT_FOUND");
    }

    const log = current[0];

    if (log.status === "Completed") {
      throw new ApiError(400, "Completed maintenance records cannot be deleted", "DELETE_FAILED");
    }

    await db
      .update(maintenanceLogs)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(maintenanceLogs.id, id));

    return true;
  },

  startMaintenance: async (id) => {
    return await db.transaction(async (tx) => {
      const current = await tx
        .select()
        .from(maintenanceLogs)
        .where(and(eq(maintenanceLogs.id, id), isNull(maintenanceLogs.deletedAt)))
        .limit(1);

      if (current.length === 0) {
        throw new ApiError(404, "Maintenance record not found", "MAINTENANCE_NOT_FOUND");
      }
      const log = current[0];

      if (log.status !== "Open") {
        throw new ApiError(400, "Maintenance must be in Open status to be started", "VALIDATION_ERROR");
      }

      const updated = await tx
        .update(maintenanceLogs)
        .set({ status: "In Progress", updatedAt: new Date() })
        .where(eq(maintenanceLogs.id, id))
        .returning();

      const vehicle = (await tx.select().from(vehicles).where(eq(vehicles.id, log.vehicleId)).limit(1))[0];
      if (vehicle && vehicle.status !== "Retired") {
        await tx
          .update(vehicles)
          .set({ status: "In Shop", updatedAt: new Date() })
          .where(eq(vehicles.id, log.vehicleId));
      }

      return updated[0];

    });
  },

  completeMaintenance: async (id, completeData) => {
    return await db.transaction(async (tx) => {
      const current = await tx
        .select()
        .from(maintenanceLogs)
        .where(and(eq(maintenanceLogs.id, id), isNull(maintenanceLogs.deletedAt)))
        .limit(1);

      if (current.length === 0) {
        throw new ApiError(404, "Maintenance record not found", "MAINTENANCE_NOT_FOUND");
      }
      const log = current[0];

      if (log.status !== "In Progress") {
        throw new ApiError(400, "Maintenance must be In Progress to be completed", "VALIDATION_ERROR");
      }

      const compDateStr = completeData.completion_date || new Date().toISOString().split("T")[0];
      if (log.startDate && compDateStr < log.startDate) {
        throw new ApiError(400, "Completion date cannot be before start date", "VALIDATION_ERROR");
      }

      const updated = await tx
        .update(maintenanceLogs)
        .set({
          status: "Completed",
          actualCost: String(completeData.actual_cost),
          completionDate: compDateStr,
          remarks: completeData.remarks || log.remarks,
          updatedAt: new Date()
        })
        .where(eq(maintenanceLogs.id, id))
        .returning();

      const vehicle = (await tx.select().from(vehicles).where(eq(vehicles.id, log.vehicleId)).limit(1))[0];
      if (vehicle && vehicle.status !== "Retired") {
        await tx
          .update(vehicles)
          .set({ status: "Available", updatedAt: new Date() })
          .where(eq(vehicles.id, log.vehicleId));
      }

      return updated[0];
    });
  },

  cancelMaintenance: async (id) => {
    return await db.transaction(async (tx) => {
      const current = await tx
        .select()
        .from(maintenanceLogs)
        .where(and(eq(maintenanceLogs.id, id), isNull(maintenanceLogs.deletedAt)))
        .limit(1);

      if (current.length === 0) {
        throw new ApiError(404, "Maintenance record not found", "MAINTENANCE_NOT_FOUND");
      }
      const log = current[0];

      if (log.status !== "Open" && log.status !== "In Progress") {
        throw new ApiError(400, "Only Open or In Progress maintenance can be cancelled", "VALIDATION_ERROR");
      }

      const updated = await tx
        .update(maintenanceLogs)
        .set({ status: "Cancelled", updatedAt: new Date() })
        .where(eq(maintenanceLogs.id, id))
        .returning();

      const vehicle = (await tx.select().from(vehicles).where(eq(vehicles.id, log.vehicleId)).limit(1))[0];
      if (vehicle && vehicle.status !== "Retired") {
        await tx
          .update(vehicles)
          .set({ status: "Available", updatedAt: new Date() })
          .where(eq(vehicles.id, log.vehicleId));
      }

      return updated[0];
    });
  },

  getMaintenanceStatistics: async () => {
    const list = await db
      .select({
        status: maintenanceLogs.status,
        estimatedCost: maintenanceLogs.estimatedCost,
        actualCost: maintenanceLogs.actualCost,
      })
      .from(maintenanceLogs)
      .where(isNull(maintenanceLogs.deletedAt));

    let totalMaintenance = list.length;
    let open = 0;
    let inProgress = 0;
    let completed = 0;
    let cancelled = 0;
    let totalEstimatedCost = 0;
    let totalActualCost = 0;

    for (const log of list) {
      if (log.status === "Open") open++;
      else if (log.status === "In Progress") inProgress++;
      else if (log.status === "Completed") completed++;
      else if (log.status === "Cancelled") cancelled++;

      if (log.estimatedCost) {
        totalEstimatedCost += Number(log.estimatedCost);
      }
      if (log.actualCost) {
        totalActualCost += Number(log.actualCost);
      }
    }

    return {
      totalMaintenance,
      open,
      inProgress,
      completed,
      cancelled,
      totalEstimatedCost,
      totalActualCost,
    };
  },
};
