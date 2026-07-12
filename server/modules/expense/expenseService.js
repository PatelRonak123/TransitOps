import { db } from "../../config/dbConfig.js";
import { expenses } from "./expenseModel.js";
import { vehicles } from "../vehicle/vehicleModel.js";
import { trips } from "../trip/tripModel.js";
import { maintenanceLogs } from "../maintenance/maintenanceModel.js";
import { fuelLogs } from "../fuel/fuelModel.js";
import { users } from "../../db/Schema/schema.js";
import { eq, and, or, ilike, desc, asc, isNull, count, sql, gte, lte } from "drizzle-orm";
import { ApiError } from "../../utils/ApiError.js";

export const expenseService = {
  createExpense: async (data, userId) => {
    return await db.transaction(async (tx) => {
      // Rule 2: Amount must be greater than zero
      const amt = Number(data.amount);
      if (isNaN(amt) || amt <= 0) {
        throw new ApiError(400, "Amount must be a positive number greater than zero", "VALIDATION_ERROR");
      }

      // Rule 3: Expense Date cannot be in the future
      if (new Date(data.expense_date) > new Date()) {
        throw new ApiError(400, "Expense date cannot be in the future", "VALIDATION_ERROR");
      }

      if (!data.vehicle_id && !data.trip_id && !data.maintenance_id) {
        throw new ApiError(400, "Expense must be linked to a Vehicle, Trip or Maintenance.", "VALIDATION_ERROR");
      }

      if (data.trip_id) {
        const trip = await tx
          .select()
          .from(trips)
          .where(and(eq(trips.id, data.trip_id), isNull(trips.deletedAt)))
          .limit(1);
        if (trip.length === 0) {
          throw new ApiError(404, "Trip not found", "TRIP_NOT_FOUND");
        }
      }

      if (data.maintenance_id) {
        const maintenance = await tx
          .select()
          .from(maintenanceLogs)
          .where(and(eq(maintenanceLogs.id, data.maintenance_id), isNull(maintenanceLogs.deletedAt)))
          .limit(1);
        if (maintenance.length === 0) {
          throw new ApiError(404, "Maintenance record not found", "MAINTENANCE_NOT_FOUND");
        }
      }

      if (data.vehicle_id) {
        const vehicle = await tx
          .select()
          .from(vehicles)
          .where(and(eq(vehicles.id, data.vehicle_id), isNull(vehicles.deletedAt)))
          .limit(1);
        if (vehicle.length === 0) {
          throw new ApiError(404, "Vehicle not found", "VEHICLE_NOT_FOUND");
        }
      }

      if (data.expense_type === "Fuel") {
        if (!data.trip_id) {
          throw new ApiError(400, "Fuel expenses must reference a trip", "VALIDATION_ERROR");
        }

        const trip = (await tx.select().from(trips).where(eq(trips.id, data.trip_id)).limit(1))[0];
        
        const fuelLog = await tx
          .select()
          .from(fuelLogs)
          .where(and(eq(fuelLogs.tripId, data.trip_id), isNull(fuelLogs.deletedAt)))
          .limit(1);

        if (fuelLog.length === 0 && trip.status !== "Completed") {
          throw new ApiError(400, "Fuel expenses must reference an existing Fuel Log OR a completed Trip", "VALIDATION_ERROR");
        }

        const existingFuelExpense = await tx
          .select()
          .from(expenses)
          .where(and(eq(expenses.tripId, data.trip_id), eq(expenses.expenseType, "Fuel"), isNull(expenses.deletedAt)))
          .limit(1);

        if (existingFuelExpense.length > 0) {
          throw new ApiError(400, "Fuel expense has already been logged for this trip", "VALIDATION_ERROR");
        }
      }

      const countResult = await tx.select({ count: count() }).from(expenses);
      const total = parseInt(countResult[0]?.count || 0, 10);
      const expenseNumber = `EXP-${String(total + 1).padStart(6, '0')}`;

      const dbPayload = {
        expenseNumber,
        vehicleId: data.vehicle_id || null,
        tripId: data.trip_id || null,
        maintenanceId: data.maintenance_id || null,
        expenseType: data.expense_type,
        title: data.title,
        description: data.description || null,
        amount: String(data.amount),
        expenseDate: data.expense_date,
        paymentMethod: data.payment_method,
        paymentStatus: data.payment_status,
        receiptUrl: data.receipt_url || null,
        vendorName: data.vendor_name || null,
        invoiceNumber: data.invoice_number || null,
        remarks: data.remarks || null,
        createdBy: userId,
      };

      const result = await tx
        .insert(expenses)
        .values(dbPayload)
        .returning();

      return result[0];
    });
  },

  getExpenses: async (query) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const {
      sortBy,
      order,
      search,
      expense_type,
      payment_status,
      vehicle_id,
      trip_id,
      maintenance_id,
      vendor,
      start_date,
      end_date
    } = query;

    const searchConditions = [];
    if (search) {
      const searchStr = `%${search.trim()}%`;
      searchConditions.push(
        or(
          ilike(expenses.expenseNumber, searchStr),
          ilike(expenses.title, searchStr),
          ilike(expenses.vendorName, searchStr),
          ilike(expenses.invoiceNumber, searchStr),
          ilike(vehicles.registrationNumber, searchStr),
          ilike(trips.tripNumber, searchStr),
          ilike(maintenanceLogs.maintenanceNumber, searchStr)
        )
      );
    }

    const filterConditions = [];
    if (expense_type) filterConditions.push(eq(expenses.expenseType, expense_type));
    if (payment_status) filterConditions.push(eq(expenses.paymentStatus, payment_status));
    if (vehicle_id) filterConditions.push(eq(expenses.vehicleId, vehicle_id));
    if (trip_id) filterConditions.push(eq(expenses.tripId, trip_id));
    if (maintenance_id) filterConditions.push(eq(expenses.maintenanceId, maintenance_id));
    if (vendor) filterConditions.push(ilike(expenses.vendorName, `%${vendor.trim()}%`));
    if (start_date) filterConditions.push(gte(expenses.expenseDate, start_date));
    if (end_date) filterConditions.push(lte(expenses.expenseDate, end_date));

    const conditions = and(
      isNull(expenses.deletedAt),
      ...searchConditions,
      ...filterConditions
    );

    const countResult = await db
      .select({ count: count() })
      .from(expenses)
      .leftJoin(vehicles, eq(expenses.vehicleId, vehicles.id))
      .leftJoin(trips, eq(expenses.tripId, trips.id))
      .leftJoin(maintenanceLogs, eq(expenses.maintenanceId, maintenanceLogs.id))
      .where(conditions);
    const total = parseInt(countResult[0]?.count || 0, 10);
    const totalPages = Math.ceil(total / limit);

    const sortFieldMap = {
      expense_date: expenses.expenseDate,
      created_date: expenses.createdAt,
      amount: expenses.amount,
      expense_type: expenses.expenseType,
      vendor: expenses.vendorName,
      payment_status: expenses.paymentStatus,
    };
    const sortField = sortFieldMap[sortBy] || expenses.createdAt;
    const sortOrder = order === "asc" ? asc(sortField) : desc(sortField);

    const data = await db
      .select({
        expense: expenses,
        vehicle: vehicles,
        trip: trips,
        maintenance: maintenanceLogs,
        creator: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        }
      })
      .from(expenses)
      .leftJoin(vehicles, eq(expenses.vehicleId, vehicles.id))
      .leftJoin(trips, eq(expenses.tripId, trips.id))
      .leftJoin(maintenanceLogs, eq(expenses.maintenanceId, maintenanceLogs.id))
      .innerJoin(users, eq(expenses.createdBy, users.id))
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

  getExpenseById: async (id) => {
    const result = await db
      .select({
        expense: expenses,
        vehicle: vehicles,
        trip: trips,
        maintenance: maintenanceLogs,
        creator: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        }
      })
      .from(expenses)
      .leftJoin(vehicles, eq(expenses.vehicleId, vehicles.id))
      .leftJoin(trips, eq(expenses.tripId, trips.id))
      .leftJoin(maintenanceLogs, eq(expenses.maintenanceId, maintenanceLogs.id))
      .innerJoin(users, eq(expenses.createdBy, users.id))
      .where(and(eq(expenses.id, id), isNull(expenses.deletedAt)))
      .limit(1);

    if (result.length === 0) {
      throw new ApiError(404, "Expense not found", "EXPENSE_NOT_FOUND");
    }
    return result[0];
  },

  updateExpense: async (id, updateData) => {
    const current = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.id, id), isNull(expenses.deletedAt)))
      .limit(1);

    if (current.length === 0) {
      throw new ApiError(404, "Expense not found", "EXPENSE_NOT_FOUND");
    }
    const log = current[0];

    if (updateData.amount !== undefined) {
      const amt = Number(updateData.amount);
      if (isNaN(amt) || amt <= 0) {
        throw new ApiError(400, "Amount must be a positive number greater than zero", "VALIDATION_ERROR");
      }
    }

    if (updateData.expense_date !== undefined) {
      if (new Date(updateData.expense_date) > new Date()) {
        throw new ApiError(400, "Expense date cannot be in the future", "VALIDATION_ERROR");
      }
    }


    if (updateData.expense_number !== undefined && updateData.expense_number !== log.expenseNumber) {
      throw new ApiError(400, "Expense number cannot be modified", "VALIDATION_ERROR");
    }
    if (updateData.vehicle_id !== undefined && updateData.vehicle_id !== log.vehicleId) {
      throw new ApiError(400, "Vehicle ID cannot be modified on expenses", "VALIDATION_ERROR");
    }
    if (updateData.trip_id !== undefined && updateData.trip_id !== log.tripId) {
      throw new ApiError(400, "Trip ID cannot be modified on expenses", "VALIDATION_ERROR");
    }
    if (updateData.maintenance_id !== undefined && updateData.maintenance_id !== log.maintenanceId) {
      throw new ApiError(400, "Maintenance ID cannot be modified on expenses", "VALIDATION_ERROR");
    }

    const dbPayload = {};
    if (updateData.title !== undefined) dbPayload.title = updateData.title;
    if (updateData.description !== undefined) dbPayload.description = updateData.description || null;
    if (updateData.amount !== undefined) dbPayload.amount = String(updateData.amount);
    if (updateData.payment_method !== undefined) dbPayload.paymentMethod = updateData.payment_method;
    if (updateData.payment_status !== undefined) dbPayload.paymentStatus = updateData.payment_status;
    if (updateData.vendor_name !== undefined) dbPayload.vendorName = updateData.vendor_name || null;
    if (updateData.invoice_number !== undefined) dbPayload.invoiceNumber = updateData.invoice_number || null;
    if (updateData.expense_date !== undefined) dbPayload.expenseDate = updateData.expense_date;
    if (updateData.remarks !== undefined) dbPayload.remarks = updateData.remarks || null;

    dbPayload.updatedAt = new Date();

    const updated = await db
      .update(expenses)
      .set(dbPayload)
      .where(eq(expenses.id, id))
      .returning();

    return updated[0];
  },

  deleteExpense: async (id) => {
    const current = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.id, id), isNull(expenses.deletedAt)))
      .limit(1);

    if (current.length === 0) {
      throw new ApiError(404, "Expense not found", "EXPENSE_NOT_FOUND");
    }

    await db
      .update(expenses)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(expenses.id, id));

    return true;
  },

  getVehicleExpenses: async (vehicleId) => {
    return await db
      .select({
        expense: expenses,
        trip: trips,
        maintenance: maintenanceLogs,
      })
      .from(expenses)
      .leftJoin(trips, eq(expenses.tripId, trips.id))
      .leftJoin(maintenanceLogs, eq(expenses.maintenanceId, maintenanceLogs.id))
      .where(and(eq(expenses.vehicleId, vehicleId), isNull(expenses.deletedAt)))
      .orderBy(desc(expenses.expenseDate));
  },

  getTripExpenses: async (tripId) => {
    return await db
      .select({
        expense: expenses,
        vehicle: vehicles,
        maintenance: maintenanceLogs,
      })
      .from(expenses)
      .leftJoin(vehicles, eq(expenses.vehicleId, vehicles.id))
      .leftJoin(maintenanceLogs, eq(expenses.maintenanceId, maintenanceLogs.id))
      .where(and(eq(expenses.tripId, tripId), isNull(expenses.deletedAt)))
      .orderBy(desc(expenses.expenseDate));
  },

  getMaintenanceExpenses: async (maintenanceId) => {
    return await db
      .select({
        expense: expenses,
        vehicle: vehicles,
        trip: trips,
      })
      .from(expenses)
      .leftJoin(vehicles, eq(expenses.vehicleId, vehicles.id))
      .leftJoin(trips, eq(expenses.tripId, trips.id))
      .where(and(eq(expenses.maintenanceId, maintenanceId), isNull(expenses.deletedAt)))
      .orderBy(desc(expenses.expenseDate));
  },

  getMonthlyExpenseReport: async (month, year) => {
    const startStr = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endStr = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const data = await db
      .select({
        expense: expenses,
        vehicle: vehicles,
        trip: trips,
      })
      .from(expenses)
      .leftJoin(vehicles, eq(expenses.vehicleId, vehicles.id))
      .leftJoin(trips, eq(expenses.tripId, trips.id))
      .where(
        and(
          isNull(expenses.deletedAt),
          sql`date(${expenses.expenseDate}) >= ${startStr}`,
          sql`date(${expenses.expenseDate}) <= ${endStr}`
        )
      )
      .orderBy(asc(expenses.expenseDate));

    let totalAmount = 0;
    const categoryBreakdown = {};

    for (const item of data) {
      const amt = Number(item.expense.amount || 0);
      totalAmount += amt;
      const cat = item.expense.expenseType;
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + amt;
    }

    return {
      month: parseInt(month, 10),
      year: parseInt(year, 10),
      totalAmount,
      categoryBreakdown,
      logs: data,
    };
  },

  getExpenseStatistics: async () => {
    const list = await db
      .select({
        expenseType: expenses.expenseType,
        amount: expenses.amount,
        vehicleId: expenses.vehicleId,
        tripId: expenses.tripId,
        expenseDate: expenses.expenseDate,
      })
      .from(expenses)
      .where(isNull(expenses.deletedAt));

    const activeVehicles = await db
      .select({ id: vehicles.id, registrationNumber: vehicles.registrationNumber, vehicleName: vehicles.vehicleName })
      .from(vehicles)
      .where(isNull(vehicles.deletedAt));

    const completedTrips = await db
      .select({ id: trips.id, actualDistance: trips.actualDistance })
      .from(trips)
      .where(and(eq(trips.status, "Completed"), isNull(trips.deletedAt)));

    let totalExpenses = list.length;
    let totalAmount = 0;
    let fuelExpense = 0;
    let maintenanceExpense = 0;
    let repairExpense = 0;
    let insuranceExpense = 0;
    let parkingExpense = 0;
    let tollExpense = 0;
    let otherExpense = 0;

    const vehicleCostMap = {};
    const categoryCostMap = {};

    for (const exp of list) {
      const amt = Number(exp.amount || 0);
      totalAmount += amt;

      const type = exp.expenseType;
      categoryCostMap[type] = (categoryCostMap[type] || 0) + amt;

      if (type === "Fuel") fuelExpense += amt;
      else if (type === "Maintenance") maintenanceExpense += amt;
      else if (type === "Repair") repairExpense += amt;
      else if (type === "Insurance") insuranceExpense += amt;
      else if (type === "Parking") parkingExpense += amt;
      else if (type === "Toll") tollExpense += amt;
      else otherExpense += amt;

      if (exp.vehicleId) {
        vehicleCostMap[exp.vehicleId] = (vehicleCostMap[exp.vehicleId] || 0) + amt;
      }
    }

    const vehicleCount = activeVehicles.length || 1;
    const tripCount = completedTrips.length || 1;

    const averageExpensePerVehicle = totalAmount / vehicleCount;
    const averageExpensePerTrip = totalAmount / tripCount;

    let totalDistance = 0;
    for (const t of completedTrips) {
      totalDistance += Number(t.actualDistance || 0);
    }
    const averageExpensePerKm = totalDistance > 0 ? totalAmount / totalDistance : 0;

    const monthlyTrend = {};
    for (const exp of list) {
      if (exp.expenseDate) {
        const dateParts = exp.expenseDate.split("-");
        if (dateParts.length >= 2) {
          const key = `${dateParts[0]}-${dateParts[1]}`;
          monthlyTrend[key] = (monthlyTrend[key] || 0) + Number(exp.amount || 0);
        }
      }
    }
    const monthlyExpenses = Object.keys(monthlyTrend).map(key => ({
      month: key,
      amount: monthlyTrend[key]
    })).sort((a, b) => a.month.localeCompare(b.month));

    const expenseByCategory = Object.keys(categoryCostMap).map(cat => ({
      category: cat,
      amount: categoryCostMap[cat]
    })).sort((a, b) => b.amount - a.amount);

    const vehicleWiseExpense = activeVehicles.map(v => ({
      vehicle_id: v.id,
      registration_number: v.registrationNumber,
      vehicle_name: v.vehicleName,
      amount: vehicleCostMap[v.id] || 0
    })).sort((a, b) => b.amount - a.amount);

    const top5CostliestVehicles = vehicleWiseExpense.slice(0, 5);
    const topExpenseCategories = expenseByCategory.slice(0, 5);

    return {
      totalExpenses,
      totalAmount,
      fuelExpense,
      maintenanceExpense,
      repairExpense,
      insuranceExpense,
      parkingExpense,
      tollExpense,
      otherExpense,
      dashboard: {
        totalOperationalCost: totalAmount,
        monthlyExpenses,
        expenseByCategory,
        vehicleWiseExpense,
        averageExpensePerVehicle: Number(averageExpensePerVehicle.toFixed(2)),
        averageExpensePerTrip: Number(averageExpensePerTrip.toFixed(2)),
        averageExpensePerKm: Number(averageExpensePerKm.toFixed(2)),
        fuelVsMaintenanceCost: {
          fuel: fuelExpense,
          maintenance: maintenanceExpense
        },
        top5CostliestVehicles,
        topExpenseCategories
      }
    };
  },
};
