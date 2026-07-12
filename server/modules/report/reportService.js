import { db } from "../../config/dbConfig.js";
import { vehicles } from "../vehicle/vehicleModel.js";
import { drivers } from "../driver/driverModel.js";
import { trips } from "../trip/tripModel.js";
import { maintenanceLogs } from "../maintenance/maintenanceModel.js";
import { fuelLogs } from "../fuel/fuelModel.js";
import { expenses } from "../expense/expenseModel.js";
import { dashboardService } from "../dashboard/dashboardService.js";
import { eq, and, or, isNull, sql, notInArray, lt, gte, lte, desc, asc, inArray, count } from "drizzle-orm";

const getDateFilters = (column, from, to) => {
  const filters = [];
  if (from && from.trim() !== "") {
    filters.push(sql`date(${column}) >= ${from}`);
  }
  if (to && to.trim() !== "") {
    filters.push(sql`date(${column}) <= ${to}`);
  }
  return filters;
};

const getGroupByExpressions = (column, groupBy) => {
  const g = (groupBy || "").toLowerCase();
  if (g === "daily" || g === "day") {
    return {
      select: sql`to_char(${column}, 'YYYY-MM-DD')`,
      group: [sql`to_char(${column}, 'YYYY-MM-DD')`],
      order: sql`to_char(${column}, 'YYYY-MM-DD')`
    };
  }
  if (g === "weekly" || g === "week") {
    return {
      select: sql`to_char(${column}, 'IYYY-"W"IW')`,
      group: [sql`to_char(${column}, 'IYYY-"W"IW')`],
      order: sql`to_char(${column}, 'IYYY-"W"IW')`
    };
  }
  if (g === "quarterly" || g === "quarter") {
    return {
      select: sql`to_char(${column}, 'YYYY "Q"Q')`,
      group: [sql`to_char(${column}, 'YYYY "Q"Q')`],
      order: sql`to_char(${column}, 'YYYY "Q"Q')`
    };
  }
  if (g === "yearly" || g === "year") {
    return {
      select: sql`to_char(${column}, 'YYYY')`,
      group: [sql`to_char(${column}, 'YYYY')`],
      order: sql`to_char(${column}, 'YYYY')`
    };
  }
  // Monthly (default)
  return {
    select: sql`to_char(${column}, 'Mon YYYY')`,
    group: [sql`to_char(${column}, 'Mon YYYY')`, sql`to_char(${column}, 'YYYY-MM')`],
    order: sql`to_char(${column}, 'YYYY-MM')`
  };
};

export const reportService = {
  getVehicleReport: async (query) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { from, to, vehicleStatus, search, sortBy, order } = query;

    const searchFilters = [];
    if (search && search.trim() !== "") {
      const s = `%${search.trim()}%`;
      searchFilters.push(or(
        ilike(vehicles.registrationNumber, s),
        ilike(vehicles.vehicleName, s)
      ));
    }

    const filterFilters = [];
    if (vehicleStatus) {
      filterFilters.push(eq(vehicles.status, vehicleStatus));
    }

    const conditions = and(
      isNull(vehicles.deletedAt),
      ...getDateFilters(vehicles.createdAt, from, to),
      ...searchFilters,
      ...filterFilters
    );

    const countResult = await db.select({ count: count() }).from(vehicles).where(conditions);
    const total = parseInt(countResult[0]?.count || 0, 10);
    const totalPages = Math.ceil(total / limit);

    const sortFieldMap = {
      createdAt: vehicles.createdAt,
      updatedAt: vehicles.updatedAt,
      vehicle: vehicles.vehicleName
    };
    const sortField = sortFieldMap[sortBy] || vehicles.createdAt;
    const sortOrder = order?.toLowerCase() === "asc" ? asc(sortField) : desc(sortField);

    const vehicleList = await db
      .select()
      .from(vehicles)
      .where(conditions)
      .orderBy(sortOrder)
      .limit(limit)
      .offset(offset);

    // Compute status counts for KPI
    const allVehicles = await db
      .select({ id: vehicles.id, status: vehicles.status })
      .from(vehicles)
      .where(and(isNull(vehicles.deletedAt), ...getDateFilters(vehicles.createdAt, from, to)));

    let totalVehicles = allVehicles.length;
    let activeVehicles = 0;
    let availableVehicles = 0;
    let vehiclesOnTrip = 0;
    let vehiclesInMaintenance = 0;

    for (const v of allVehicles) {
      if (v.status === "On Trip") {
        activeVehicles++;
        vehiclesOnTrip++;
      } else if (v.status === "Available") {
        availableVehicles++;
      } else if (v.status === "In Shop") {
        vehiclesInMaintenance++;
      }
    }

    const vehicleUtilization = totalVehicles > 0 ? (vehiclesOnTrip / totalVehicles) * 100 : 0;

    // Fetch cost totals per vehicle
    const vehicleExpenses = await db
      .select({
        vehicleId: expenses.vehicleId,
        fuelCost: sql`SUM(CASE WHEN ${expenses.expenseType} = 'Fuel' THEN ${expenses.amount} ELSE 0 END)`,
        maintenanceCost: sql`SUM(CASE WHEN ${expenses.expenseType} IN ('Maintenance', 'Repair') THEN ${expenses.amount} ELSE 0 END)`,
        totalExpense: sql`SUM(${expenses.amount})`
      })
      .from(expenses)
      .where(and(isNull(expenses.deletedAt), ...getDateFilters(expenses.expenseDate, from, to)))
      .groupBy(expenses.vehicleId);

    const expenseMap = {};
    let totalOperationalCost = 0;
    for (const exp of vehicleExpenses) {
      if (exp.vehicleId) {
        expenseMap[exp.vehicleId] = {
          fuelCost: Number(exp.fuelCost || 0),
          maintenanceCost: Number(exp.maintenanceCost || 0),
          totalExpense: Number(exp.totalExpense || 0)
        };
      }
      totalOperationalCost += Number(exp.totalExpense || 0);
    }

    const details = vehicleList.map(v => {
      const stats = expenseMap[v.id] || { fuelCost: 0, maintenanceCost: 0, totalExpense: 0 };
      return {
        id: v.id,
        registration_number: v.registrationNumber,
        vehicle_name: v.vehicleName,
        vehicle_model: v.vehicleModel,
        vehicle_type: v.vehicleType,
        odometer: Number(v.odometer),
        status: v.status,
        created_at: v.createdAt,
        fuel_cost: stats.fuelCost,
        maintenance_cost: stats.maintenanceCost,
        total_expense: stats.totalExpense
      };
    });

    return {
      summary: {
        totalVehicles,
        activeVehicles,
        availableVehicles,
        vehiclesOnTrip,
        vehiclesInMaintenance,
        vehicleUtilization: Number(vehicleUtilization.toFixed(2)),
        totalOperationalCost: Number(totalOperationalCost.toFixed(2))
      },
      data: details,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  },

  getDriverReport: async (query) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { from, to, search, sortBy, order } = query;

    const searchFilters = [];
    if (search && search.trim() !== "") {
      const s = `%${search.trim()}%`;
      searchFilters.push(or(
        ilike(drivers.fullName, s),
        ilike(drivers.email, s)
      ));
    }

    const conditions = and(
      isNull(drivers.deletedAt),
      ...getDateFilters(drivers.createdAt, from, to),
      ...searchFilters
    );

    const countResult = await db.select({ count: count() }).from(drivers).where(conditions);
    const total = parseInt(countResult[0]?.count || 0, 10);
    const totalPages = Math.ceil(total / limit);

    const sortFieldMap = {
      createdAt: drivers.createdAt,
      updatedAt: drivers.updatedAt,
      driver: drivers.fullName
    };
    const sortField = sortFieldMap[sortBy] || drivers.createdAt;
    const sortOrder = order?.toLowerCase() === "asc" ? asc(sortField) : desc(sortField);

    const driverList = await db
      .select()
      .from(drivers)
      .where(conditions)
      .orderBy(sortOrder)
      .limit(limit)
      .offset(offset);

    // Summary KPIs
    const allDrivers = await db
      .select({ id: drivers.id, status: drivers.status })
      .from(drivers)
      .where(and(isNull(drivers.deletedAt), ...getDateFilters(drivers.createdAt, from, to)));

    let totalDrivers = allDrivers.length;
    let activeDrivers = 0;
    let availableDrivers = 0;
    let driversOnTrip = 0;

    for (const d of allDrivers) {
      if (d.status === "On Trip") {
        activeDrivers++;
        driversOnTrip++;
      } else if (d.status === "Available") {
        availableDrivers++;
      }
    }

    // Group trip stats per driver
    const driverTripStats = await db
      .select({
        driverId: trips.driverId,
        tripCount: count(trips.id),
        totalDistance: sql`SUM(${trips.actualDistance})`,
        fuelConsumed: sql`SUM(${trips.fuelConsumed})`
      })
      .from(trips)
      .where(and(
        eq(trips.status, "Completed"),
        isNull(trips.deletedAt),
        ...getDateFilters(trips.createdAt, from, to)
      ))
      .groupBy(trips.driverId);

    const statsMap = {};
    for (const s of driverTripStats) {
      statsMap[s.driverId] = {
        tripCount: parseInt(s.tripCount || 0, 10),
        totalDistance: Number(s.totalDistance || 0),
        fuelConsumed: Number(s.fuelConsumed || 0)
      };
    }

    const details = driverList.map(d => {
      const stats = statsMap[d.id] || { tripCount: 0, totalDistance: 0, fuelConsumed: 0 };
      return {
        id: d.id,
        full_name: d.fullName,
        license_number: d.licenseNumber,
        email: d.email,
        contact_number: d.contactNumber,
        status: d.status,
        safety_score: d.safetyScore,
        trip_count: stats.tripCount,
        total_distance: stats.totalDistance,
        fuel_consumption: stats.fuelConsumed
      };
    });

    return {
      summary: {
        totalDrivers,
        activeDrivers,
        availableDrivers,
        driversOnTrip
      },
      data: details,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  },

  getTripReport: async (query) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { from, to, search, tripStatus, sortBy, order } = query;

    const searchFilters = [];
    if (search && search.trim() !== "") {
      const s = `%${search.trim()}%`;
      searchFilters.push(or(
        ilike(trips.tripNumber, s),
        ilike(vehicles.registrationNumber, s),
        ilike(drivers.fullName, s)
      ));
    }

    const filterFilters = [];
    if (tripStatus) {
      filterFilters.push(eq(trips.status, tripStatus));
    }

    const conditions = and(
      isNull(trips.deletedAt),
      ...getDateFilters(trips.createdAt, from, to),
      ...searchFilters,
      ...filterFilters
    );

    const countResult = await db
      .select({ count: count() })
      .from(trips)
      .leftJoin(vehicles, eq(trips.vehicleId, vehicles.id))
      .leftJoin(drivers, eq(trips.driverId, drivers.id))
      .where(conditions);
    const total = parseInt(countResult[0]?.count || 0, 10);
    const totalPages = Math.ceil(total / limit);

    const sortFieldMap = {
      createdAt: trips.createdAt,
      updatedAt: trips.updatedAt,
      distance: trips.actualDistance,
      revenue: trips.revenue
    };
    const sortField = sortFieldMap[sortBy] || trips.createdAt;
    const sortOrder = order?.toLowerCase() === "asc" ? asc(sortField) : desc(sortField);

    const tripList = await db
      .select({
        trip: trips,
        vehicle: vehicles,
        driver: drivers
      })
      .from(trips)
      .leftJoin(vehicles, eq(trips.vehicleId, vehicles.id))
      .leftJoin(drivers, eq(trips.driverId, drivers.id))
      .where(conditions)
      .orderBy(sortOrder)
      .limit(limit)
      .offset(offset);

    // Summary KPIs
    const allTrips = await db
      .select({
        status: trips.status,
        actualDistance: trips.actualDistance,
        fuelConsumed: trips.fuelConsumed,
        dispatchDate: trips.dispatchDate,
        completionDate: trips.completionDate
      })
      .from(trips)
      .where(and(isNull(trips.deletedAt), ...getDateFilters(trips.createdAt, from, to)));

    let totalTrips = allTrips.length;
    let activeTrips = 0;
    let completedTrips = 0;
    let cancelledTrips = 0;
    let distanceSum = 0;
    let fuelSum = 0;
    let durationSum = 0;
    let durationCount = 0;

    for (const t of allTrips) {
      if (t.status === "Dispatched") {
        activeTrips++;
      } else if (t.status === "Completed") {
        completedTrips++;
        distanceSum += Number(t.actualDistance || 0);
        fuelSum += Number(t.fuelConsumed || 0);

        if (t.dispatchDate && t.completionDate) {
          const hours = (new Date(t.completionDate) - new Date(t.dispatchDate)) / (1000 * 60 * 60);
          durationSum += hours;
          durationCount++;
        }
      } else if (t.status === "Cancelled") {
        cancelledTrips++;
      }
    }

    const averageTripDistance = completedTrips > 0 ? distanceSum / completedTrips : 0;
    const averageTripDuration = durationCount > 0 ? durationSum / durationCount : 0;

    // Group expenses by tripId
    const tripExpenses = await db
      .select({
        tripId: expenses.tripId,
        totalCost: sql`SUM(${expenses.amount})`
      })
      .from(expenses)
      .where(and(isNull(expenses.deletedAt), ...getDateFilters(expenses.expenseDate, from, to)))
      .groupBy(expenses.tripId);

    const expenseMap = {};
    for (const e of tripExpenses) {
      if (e.tripId) {
        expenseMap[e.tripId] = Number(e.totalCost || 0);
      }
    }

    const details = tripList.map(item => {
      const tripCost = expenseMap[item.trip.id] || 0;
      return {
        id: item.trip.id,
        trip_number: item.trip.tripNumber,
        source: item.trip.source,
        destination: item.trip.destination,
        actual_distance: Number(item.trip.actualDistance || 0),
        fuel_consumed: Number(item.trip.fuelConsumed || 0),
        status: item.trip.status,
        dispatch_date: item.trip.dispatchDate,
        completion_date: item.trip.completionDate,
        trip_cost: tripCost,
        driver: {
          id: item.driver.id,
          full_name: item.driver.fullName,
          license_number: item.driver.licenseNumber
        },
        vehicle: {
          id: item.vehicle.id,
          registration_number: item.vehicle.registrationNumber,
          vehicle_name: item.vehicle.vehicleName
        }
      };
    });

    return {
      summary: {
        totalTrips,
        activeTrips,
        completedTrips,
        cancelledTrips,
        averageTripDistance: Number(averageTripDistance.toFixed(2)),
        averageTripDuration: Number(averageTripDuration.toFixed(2)),
        fuelUsed: Number(fuelSum.toFixed(2))
      },
      data: details,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  },

  getFuelReport: async (query) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { from, to, search, fuelType, vehicleId, tripId, groupBy, sortBy, order } = query;

    const searchFilters = [];
    if (search && search.trim() !== "") {
      searchFilters.push(or(
        ilike(fuelLogs.fuelLogNumber, `%${search.trim()}%`),
        ilike(vehicles.registrationNumber, `%${search.trim()}%`)
      ));
    }

    const filterFilters = [];
    if (fuelType) filterFilters.push(eq(fuelLogs.fuelType, fuelType));
    if (vehicleId) filterFilters.push(eq(fuelLogs.vehicleId, vehicleId));
    if (tripId) filterFilters.push(eq(fuelLogs.tripId, tripId));

    const conditions = and(
      isNull(fuelLogs.deletedAt),
      ...getDateFilters(fuelLogs.fuelDate, from, to),
      ...searchFilters,
      ...filterFilters
    );

    const countResult = await db
      .select({ count: count() })
      .from(fuelLogs)
      .leftJoin(vehicles, eq(fuelLogs.vehicleId, vehicles.id))
      .where(conditions);
    const total = parseInt(countResult[0]?.count || 0, 10);
    const totalPages = Math.ceil(total / limit);

    const sortFieldMap = {
      createdAt: fuelLogs.createdAt,
      updatedAt: fuelLogs.updatedAt,
      date: fuelLogs.fuelDate,
      cost: fuelLogs.totalCost,
      fuel: fuelLogs.liters
    };
    const sortField = sortFieldMap[sortBy] || fuelLogs.createdAt;
    const sortOrder = order?.toLowerCase() === "asc" ? asc(sortField) : desc(sortField);

    const logsList = await db
      .select({
        log: fuelLogs,
        vehicle: vehicles,
        trip: trips
      })
      .from(fuelLogs)
      .leftJoin(vehicles, eq(fuelLogs.vehicleId, vehicles.id))
      .leftJoin(trips, eq(fuelLogs.tripId, trips.id))
      .where(conditions)
      .orderBy(sortOrder)
      .limit(limit)
      .offset(offset);

    const allLogs = await db
      .select({
        liters: fuelLogs.liters,
        totalCost: fuelLogs.totalCost,
        fuelEfficiency: fuelLogs.fuelEfficiency
      })
      .from(fuelLogs)
      .where(and(isNull(fuelLogs.deletedAt), ...getDateFilters(fuelLogs.fuelDate, from, to)));

    let totalFuelLogs = allLogs.length;
    let totalFuelCost = 0;
    let totalFuelConsumed = 0;
    let efficiencySum = 0;
    let efficiencyCount = 0;

    for (const l of allLogs) {
      totalFuelCost += Number(l.totalCost || 0);
      totalFuelConsumed += Number(l.liters || 0);
      if (l.fuelEfficiency !== null && l.fuelEfficiency !== undefined) {
        efficiencySum += Number(l.fuelEfficiency);
        efficiencyCount++;
      }
    }
    const averageFuelEfficiency = efficiencyCount > 0 ? efficiencySum / efficiencyCount : 0;

    // Average cost per KM
    const completedTrips = await db
      .select({ actualDistance: trips.actualDistance })
      .from(trips)
      .where(and(eq(trips.status, "Completed"), isNull(trips.deletedAt), ...getDateFilters(trips.createdAt, from, to)));

    let totalDistance = 0;
    for (const t of completedTrips) {
      totalDistance += Number(t.actualDistance || 0);
    }
    const averageCostPerKm = totalDistance > 0 ? totalFuelCost / totalDistance : 0;

    const grp = getGroupByExpressions(fuelLogs.fuelDate, groupBy);
    const trend = await db
      .select({
        label: grp.select,
        value: sql`sum(${fuelLogs.totalCost})`
      })
      .from(fuelLogs)
      .where(and(isNull(fuelLogs.deletedAt), ...getDateFilters(fuelLogs.fuelDate, from, to)))
      .groupBy(...grp.group)
      .orderBy(grp.order);

    const details = logsList.map(item => ({
      id: item.log.id,
      fuel_log_number: item.log.fuelLogNumber,
      fuel_station: item.log.fuelStation,
      fuel_type: item.log.fuelType,
      liters: Number(item.log.liters),
      price_per_liter: Number(item.log.pricePerLiter),
      total_cost: Number(item.log.totalCost),
      fuel_efficiency: Number(item.log.fuelEfficiency || 0),
      fuel_date: item.log.fuelDate,
      vehicle: item.vehicle,
      trip: item.trip
    }));

    return {
      summary: {
        totalFuelLogs,
        totalFuelCost: Number(totalFuelCost.toFixed(2)),
        totalFuelConsumed: Number(totalFuelConsumed.toFixed(2)),
        averageFuelEfficiency: Number(averageFuelEfficiency.toFixed(2)),
        averageCostPerKm: Number(averageCostPerKm.toFixed(2)),
        monthlyFuelTrend: trend.map(t => ({ label: t.label, value: Number(t.value || 0) }))
      },
      data: details,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  },

  getMaintenanceReport: async (query) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { from, to, search, maintenanceStatus, vehicleId, groupBy, sortBy, order } = query;

    const searchFilters = [];
    if (search && search.trim() !== "") {
      searchFilters.push(or(
        ilike(maintenanceLogs.maintenanceNumber, `%${search.trim()}%`),
        ilike(vehicles.registrationNumber, `%${search.trim()}%`)
      ));
    }

    const filterFilters = [];
    if (maintenanceStatus) filterFilters.push(eq(maintenanceLogs.status, maintenanceStatus));
    if (vehicleId) filterFilters.push(eq(maintenanceLogs.vehicleId, vehicleId));

    const conditions = and(
      isNull(maintenanceLogs.deletedAt),
      ...getDateFilters(maintenanceLogs.createdAt, from, to),
      ...searchFilters,
      ...filterFilters
    );

    const countResult = await db
      .select({ count: count() })
      .from(maintenanceLogs)
      .leftJoin(vehicles, eq(maintenanceLogs.vehicleId, vehicles.id))
      .where(conditions);
    const total = parseInt(countResult[0]?.count || 0, 10);
    const totalPages = Math.ceil(total / limit);

    const sortFieldMap = {
      createdAt: maintenanceLogs.createdAt,
      updatedAt: maintenanceLogs.updatedAt,
      date: maintenanceLogs.startDate,
      cost: maintenanceLogs.actualCost
    };
    const sortField = sortFieldMap[sortBy] || maintenanceLogs.createdAt;
    const sortOrder = order?.toLowerCase() === "asc" ? asc(sortField) : desc(sortField);

    const logsList = await db
      .select({
        log: maintenanceLogs,
        vehicle: vehicles
      })
      .from(maintenanceLogs)
      .leftJoin(vehicles, eq(maintenanceLogs.vehicleId, vehicles.id))
      .where(conditions)
      .orderBy(sortOrder)
      .limit(limit)
      .offset(offset);

    const allLogs = await db
      .select({
        status: maintenanceLogs.status,
        actualCost: maintenanceLogs.actualCost,
        expectedCompletionDate: maintenanceLogs.expectedCompletionDate
      })
      .from(maintenanceLogs)
      .where(and(isNull(maintenanceLogs.deletedAt), ...getDateFilters(maintenanceLogs.createdAt, from, to)));

    let scheduledMaintenance = 0;
    let completedMaintenance = 0;
    let pendingMaintenance = 0;
    let overdueMaintenance = 0;
    let totalCost = 0;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    for (const m of allLogs) {
      totalCost += Number(m.actualCost || 0);

      if (m.status === "Open") scheduledMaintenance++;
      else if (m.status === "In Progress") pendingMaintenance++;
      else if (m.status === "Completed") completedMaintenance++;

      if (m.status !== "Completed" && m.status !== "Cancelled" && m.expectedCompletionDate) {
        if (new Date(m.expectedCompletionDate) < todayDate) overdueMaintenance++;
      }
    }

    const grp = getGroupByExpressions(maintenanceLogs.createdAt, groupBy);
    const trend = await db
      .select({
        label: grp.select,
        value: sql`sum(${maintenanceLogs.actualCost})`
      })
      .from(maintenanceLogs)
      .where(and(isNull(maintenanceLogs.deletedAt), ...getDateFilters(maintenanceLogs.createdAt, from, to)))
      .groupBy(...grp.group)
      .orderBy(grp.order);

    const details = logsList.map(item => ({
      id: item.log.id,
      maintenance_number: item.log.maintenanceNumber,
      maintenance_type: item.log.maintenanceType,
      issue_title: item.log.issueTitle,
      actual_cost: Number(item.log.actualCost || 0),
      status: item.log.status,
      start_date: item.log.startDate,
      completion_date: item.log.completionDate,
      vehicle: item.vehicle
    }));

    return {
      summary: {
        scheduledMaintenance,
        completedMaintenance,
        pendingMaintenance,
        overdueMaintenance,
        vehicleMaintenanceCost: Number(totalCost.toFixed(2)),
        monthlyMaintenanceTrend: trend.map(t => ({ label: t.label, value: Number(t.value || 0) }))
      },
      data: details,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  },

  getExpenseReport: async (query) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { from, to, search, expenseType, vehicleId, tripId, paymentStatus, groupBy, sortBy, order } = query;

    const searchFilters = [];
    if (search && search.trim() !== "") {
      const s = `%${search.trim()}%`;
      searchFilters.push(or(
        ilike(expenses.expenseNumber, s),
        ilike(expenses.title, s),
        ilike(expenses.vendorName, s)
      ));
    }

    const filterFilters = [];
    if (expenseType) filterFilters.push(eq(expenses.expenseType, expenseType));
    if (vehicleId) filterFilters.push(eq(expenses.vehicleId, vehicleId));
    if (tripId) filterFilters.push(eq(expenses.tripId, tripId));
    if (paymentStatus) filterFilters.push(eq(expenses.paymentStatus, paymentStatus));

    const conditions = and(
      isNull(expenses.deletedAt),
      ...getDateFilters(expenses.expenseDate, from, to),
      ...searchFilters,
      ...filterFilters
    );

    const countResult = await db
      .select({ count: count() })
      .from(expenses)
      .leftJoin(vehicles, eq(expenses.vehicleId, vehicles.id))
      .where(conditions);
    const total = parseInt(countResult[0]?.count || 0, 10);
    const totalPages = Math.ceil(total / limit);

    const sortFieldMap = {
      createdAt: expenses.createdAt,
      updatedAt: expenses.updatedAt,
      date: expenses.expenseDate,
      amount: expenses.amount
    };
    const sortField = sortFieldMap[sortBy] || expenses.createdAt;
    const sortOrder = order?.toLowerCase() === "asc" ? asc(sortField) : desc(sortField);

    const logsList = await db
      .select({
        log: expenses,
        vehicle: vehicles,
        trip: trips
      })
      .from(expenses)
      .leftJoin(vehicles, eq(expenses.vehicleId, vehicles.id))
      .leftJoin(trips, eq(expenses.tripId, trips.id))
      .where(conditions)
      .orderBy(sortOrder)
      .limit(limit)
      .offset(offset);

    const allExpenses = await db
      .select({
        expenseType: expenses.expenseType,
        amount: expenses.amount,
        vehicleId: expenses.vehicleId
      })
      .from(expenses)
      .where(and(isNull(expenses.deletedAt), ...getDateFilters(expenses.expenseDate, from, to)));

    let totalExpenses = 0;
    const categoryBreakdown = {};
    const vehicleBreakdown = {};

    let fuelExpense = 0;
    let repairExpense = 0;
    let insuranceExpense = 0;
    let parkingExpense = 0;
    let tollExpense = 0;
    let miscellaneousExpense = 0;

    for (const e of allExpenses) {
      const amt = Number(e.amount || 0);
      totalExpenses += amt;

      const cat = e.expenseType;
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + amt;

      if (e.vehicleId) {
        vehicleBreakdown[e.vehicleId] = (vehicleBreakdown[e.vehicleId] || 0) + amt;
      }

      if (cat === "Fuel") fuelExpense += amt;
      else if (cat === "Repair") repairExpense += amt;
      else if (cat === "Insurance") insuranceExpense += amt;
      else if (cat === "Parking") parkingExpense += amt;
      else if (cat === "Toll") tollExpense += amt;
      else miscellaneousExpense += amt;
    }

    const grp = getGroupByExpressions(expenses.expenseDate, groupBy);
    const trend = await db
      .select({
        label: grp.select,
        value: sql`sum(${expenses.amount})`
      })
      .from(expenses)
      .where(and(isNull(expenses.deletedAt), ...getDateFilters(expenses.expenseDate, from, to)))
      .groupBy(...grp.group)
      .orderBy(grp.order);

    const details = logsList.map(item => ({
      id: item.log.id,
      expense_number: item.log.expenseNumber,
      expense_type: item.log.expenseType,
      title: item.log.title,
      amount: Number(item.log.amount),
      expense_date: item.log.expenseDate,
      payment_method: item.log.paymentMethod,
      payment_status: item.log.paymentStatus,
      vehicle: item.vehicle,
      trip: item.trip
    }));

    return {
      summary: {
        totalExpenses: Number(totalExpenses.toFixed(2)),
        expensesByCategory: categoryBreakdown,
        vehicleWiseExpense: vehicleBreakdown,
        monthlyExpense: trend.map(t => ({ label: t.label, value: Number(t.value || 0) })),
        fuelExpense: Number(fuelExpense.toFixed(2)),
        repairExpense: Number(repairExpense.toFixed(2)),
        insuranceExpense: Number(insuranceExpense.toFixed(2)),
        parkingExpense: Number(parkingExpense.toFixed(2)),
        tollExpense: Number(tollExpense.toFixed(2)),
        miscellaneousExpense: Number(miscellaneousExpense.toFixed(2))
      },
      data: details,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  },

  getFinancialReport: async (query) => {
    const { from, to, groupBy } = query;

    const completedTripsRevenue = await db
      .select({ revenue: trips.revenue, completionDate: trips.completionDate })
      .from(trips)
      .where(and(eq(trips.status, "Completed"), isNull(trips.deletedAt), ...getDateFilters(trips.createdAt, from, to)));

    let totalRevenue = 0;
    let totalDistance = 0;
    const tripsForDistance = await db
      .select({ actualDistance: trips.actualDistance })
      .from(trips)
      .where(and(eq(trips.status, "Completed"), isNull(trips.deletedAt), ...getDateFilters(trips.createdAt, from, to)));
    for (const t of tripsForDistance) {
      totalDistance += Number(t.actualDistance || 0);
    }

    for (const t of completedTripsRevenue) {
      totalRevenue += Number(t.revenue || 0);
    }

    const expenseList = await db
      .select({ expenseType: expenses.expenseType, amount: expenses.amount })
      .from(expenses)
      .where(and(isNull(expenses.deletedAt), ...getDateFilters(expenses.expenseDate, from, to)));

    let fuelCost = 0;
    let maintenanceCost = 0;
    let otherExpenses = 0;
    let totalOperationalCost = 0;

    for (const e of expenseList) {
      const amt = Number(e.amount || 0);
      totalOperationalCost += amt;

      if (e.expenseType === "Fuel") {
        fuelCost += amt;
      } else if (e.expenseType === "Maintenance" || e.expenseType === "Repair") {
        maintenanceCost += amt;
      } else {
        otherExpenses += amt;
      }
    }

    const costPerKm = totalDistance > 0 ? totalOperationalCost / totalDistance : 0;

    // Monthly Financial Summary
    const grpExp = getGroupByExpressions(expenses.expenseDate, groupBy);
    const expenseTrend = await db
      .select({
        label: grpExp.select,
        value: sql`sum(${expenses.amount})`
      })
      .from(expenses)
      .where(and(isNull(expenses.deletedAt), ...getDateFilters(expenses.expenseDate, from, to)))
      .groupBy(...grpExp.group)
      .orderBy(grpExp.order);

    const grpRev = getGroupByExpressions(trips.createdAt, groupBy);
    const revenueTrend = await db
      .select({
        label: grpRev.select,
        value: sql`sum(${trips.revenue})`
      })
      .from(trips)
      .where(and(eq(trips.status, "Completed"), isNull(trips.deletedAt), ...getDateFilters(trips.createdAt, from, to)))
      .groupBy(...grpRev.group)
      .orderBy(grpRev.order);

    const trendMap = {};
    for (const e of expenseTrend) {
      trendMap[e.label] = { label: e.label, expenses: Number(e.value || 0), revenue: 0 };
    }
    for (const r of revenueTrend) {
      if (trendMap[r.label]) {
        trendMap[r.label].revenue = Number(r.value || 0);
      } else {
        trendMap[r.label] = { label: r.label, expenses: 0, revenue: Number(r.value || 0) };
      }
    }
    const monthlyFinancialSummary = Object.values(trendMap);

    return {
      summary: {
        fuelCost: Number(fuelCost.toFixed(2)),
        maintenanceCost: Number(maintenanceCost.toFixed(2)),
        otherExpenses: Number(otherExpenses.toFixed(2)),
        totalOperationalCost: Number(totalOperationalCost.toFixed(2)),
        costPerKm: Number(costPerKm.toFixed(2)),
        monthlyFinancialSummary
      }
    };
  },

  getFleetUtilizationReport: async (query) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { from, to } = query;

    const vehicleList = await db
      .select()
      .from(vehicles)
      .where(isNull(vehicles.deletedAt))
      .limit(limit)
      .offset(offset);

    const vehicleCountResult = await db.select({ count: count() }).from(vehicles).where(isNull(vehicles.deletedAt));
    const total = parseInt(vehicleCountResult[0]?.count || 0, 10);
    const totalPages = Math.ceil(total / limit);

    const vehicleTripStats = await db
      .select({
        vehicleId: trips.vehicleId,
        tripsCount: count(trips.id),
        distanceSum: sql`sum(${trips.actualDistance})`,
        durationSum: sql`sum(extract(epoch from (${trips.completionDate} - ${trips.dispatchDate})) / 3600)`
      })
      .from(trips)
      .where(and(eq(trips.status, "Completed"), isNull(trips.deletedAt), ...getDateFilters(trips.createdAt, from, to)))
      .groupBy(trips.vehicleId);

    const statsMap = {};
    for (const s of vehicleTripStats) {
      statsMap[s.vehicleId] = {
        tripsCount: parseInt(s.tripsCount || 0, 10),
        distanceSum: Number(s.distanceSum || 0),
        durationSum: Number(s.durationSum || 0)
      };
    }

    const data = vehicleList.map(v => {
      const stats = statsMap[v.id] || { tripsCount: 0, distanceSum: 0, durationSum: 0 };
      let runningHours = stats.durationSum;
      if (runningHours === 0 && stats.distanceSum > 0) {
        runningHours = stats.distanceSum / 50; // estimate 1hr per 50km if time diff not present
      }
      
      const utilizationPercentage = (runningHours / 720) * 100;

      return {
        id: v.id,
        registration_number: v.registrationNumber,
        vehicle_name: v.vehicleName,
        trips: stats.tripsCount,
        distance: Number(stats.distanceSum.toFixed(2)),
        running_hours: Number(runningHours.toFixed(2)),
        utilization_percentage: Number(utilizationPercentage.toFixed(2))
      };
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  },

  getSummaryReport: async (query) => {
    const { from, to } = query;
    const dashboardSummary = await dashboardService.getDashboardSummary(from, to);
    const financialReport = await reportService.getFinancialReport(query);

    return {
      summary: {
        vehicles: dashboardSummary.fleet,
        drivers: dashboardSummary.drivers,
        trips: dashboardSummary.trips,
        maintenance: dashboardSummary.maintenance,
        fuel: dashboardSummary.fuel,
        expenses: dashboardSummary.expenses,
        financial: financialReport.summary
      }
    };
  },

  getAnalytics: async (query) => {
    const { from, to } = query;

    const allVehicles = await db.select({ status: vehicles.status }).from(vehicles).where(isNull(vehicles.deletedAt));
    const totalVehicles = allVehicles.length || 1;
    let vehiclesOnTrip = 0;
    let vehiclesInShop = 0;
    for (const v of allVehicles) {
      if (v.status === "On Trip") vehiclesOnTrip++;
      else if (v.status === "In Shop") vehiclesInShop++;
    }

    const allDrivers = await db.select({ status: drivers.status }).from(drivers).where(isNull(drivers.deletedAt));
    const totalDrivers = allDrivers.length || 1;
    let driversOnTrip = 0;
    for (const d of allDrivers) {
      if (d.status === "On Trip") driversOnTrip++;
    }

    // 1. Average fuel efficiency
    const fuelList = await db
      .select({ fuelEfficiency: fuelLogs.fuelEfficiency })
      .from(fuelLogs)
      .where(and(isNull(fuelLogs.deletedAt), ...getDateFilters(fuelLogs.fuelDate, from, to)));
    let effSum = 0;
    let effCount = 0;
    for (const f of fuelList) {
      if (f.fuelEfficiency !== null && f.fuelEfficiency !== undefined) {
        effSum += Number(f.fuelEfficiency);
        effCount++;
      }
    }
    const averageFuelEfficiency = effCount > 0 ? effSum / effCount : 0;

    // 2. Average cost per KM
    const fuelExpenses = await db
      .select({ amount: expenses.amount })
      .from(expenses)
      .where(and(isNull(expenses.deletedAt), eq(expenses.expenseType, "Fuel"), ...getDateFilters(expenses.expenseDate, from, to)));
    let totalFuelExpense = 0;
    for (const fe of fuelExpenses) {
      totalFuelExpense += Number(fe.amount || 0);
    }
    const tripsForDistance = await db
      .select({ actualDistance: trips.actualDistance })
      .from(trips)
      .where(and(eq(trips.status, "Completed"), isNull(trips.deletedAt), ...getDateFilters(trips.createdAt, from, to)));
    let totalDistance = 0;
    for (const t of tripsForDistance) {
      totalDistance += Number(t.actualDistance || 0);
    }
    const averageCostPerKm = totalDistance > 0 ? totalFuelExpense / totalDistance : 0;

    // 3. Average trip distance
    const averageTripDistance = tripsForDistance.length > 0 ? totalDistance / tripsForDistance.length : 0;

    // 4. Average maintenance cost
    const mntCosts = await db
      .select({ actualCost: maintenanceLogs.actualCost })
      .from(maintenanceLogs)
      .where(and(eq(maintenanceLogs.status, "Completed"), isNull(maintenanceLogs.deletedAt), ...getDateFilters(maintenanceLogs.createdAt, from, to)));
    let mntSum = 0;
    for (const m of mntCosts) {
      mntSum += Number(m.actualCost || 0);
    }
    const averageMaintenanceCost = mntCosts.length > 0 ? mntSum / mntCosts.length : 0;

    // 5. Average expense per vehicle
    const expenseList = await db
      .select({ amount: expenses.amount })
      .from(expenses)
      .where(and(isNull(expenses.deletedAt), ...getDateFilters(expenses.expenseDate, from, to)));
    let totalExpenses = 0;
    for (const e of expenseList) {
      totalExpenses += Number(e.amount || 0);
    }
    const averageExpensePerVehicle = totalExpenses / totalVehicles;

    // 6. Average expense per trip
    const completedTripsCount = tripsForDistance.length || 1;
    const averageExpensePerTrip = totalExpenses / completedTripsCount;

    // 7. Utilization rates
    const fleetUtilizationPercentage = (vehiclesOnTrip / totalVehicles) * 100;
    const vehicleDowntimePercentage = (vehiclesInShop / totalVehicles) * 100;
    const driverUtilizationPercentage = (driversOnTrip / totalDrivers) * 100;

    return {
      summary: {
        averageFuelEfficiency: Number(averageFuelEfficiency.toFixed(2)),
        averageCostPerKm: Number(averageCostPerKm.toFixed(2)),
        averageTripDistance: Number(averageTripDistance.toFixed(2)),
        averageMaintenanceCost: Number(averageMaintenanceCost.toFixed(2)),
        averageExpensePerVehicle: Number(averageExpensePerVehicle.toFixed(2)),
        averageExpensePerTrip: Number(averageExpensePerTrip.toFixed(2)),
        fleetUtilizationPercentage: Number(fleetUtilizationPercentage.toFixed(2)),
        vehicleDowntimePercentage: Number(vehicleDowntimePercentage.toFixed(2)),
        driverUtilizationPercentage: Number(driverUtilizationPercentage.toFixed(2))
      }
    };
  },

  getChartData: async (chartType, query) => {
    const { from, to, groupBy } = query;
    const grp = getGroupByExpressions(
      chartType === "fuel" ? fuelLogs.fuelDate :
      chartType === "expenses" ? expenses.expenseDate :
      chartType === "trips" ? trips.createdAt :
      chartType === "maintenance" ? maintenanceLogs.createdAt :
      vehicles.createdAt,
      groupBy
    );

    if (chartType === "fuel") {
      const data = await db
        .select({ label: grp.select, value: sql`sum(${fuelLogs.totalCost})` })
        .from(fuelLogs)
        .where(and(isNull(fuelLogs.deletedAt), ...getDateFilters(fuelLogs.fuelDate, from, to)))
        .groupBy(...grp.group)
        .orderBy(grp.order);
      return data.map(d => ({ label: d.label, value: Number(d.value || 0) }));
    }
    if (chartType === "expenses") {
      const data = await db
        .select({ label: grp.select, value: sql`sum(${expenses.amount})` })
        .from(expenses)
        .where(and(isNull(expenses.deletedAt), ...getDateFilters(expenses.expenseDate, from, to)))
        .groupBy(...grp.group)
        .orderBy(grp.order);
      return data.map(d => ({ label: d.label, value: Number(d.value || 0) }));
    }
    if (chartType === "trips") {
      const data = await db
        .select({ label: grp.select, value: sql`count(*)` })
        .from(trips)
        .where(and(isNull(trips.deletedAt), ...getDateFilters(trips.createdAt, from, to)))
        .groupBy(...grp.group)
        .orderBy(grp.order);
      return data.map(d => ({ label: d.label, value: Number(d.value || 0) }));
    }
    if (chartType === "maintenance") {
      const data = await db
        .select({ label: grp.select, value: sql`sum(${maintenanceLogs.actualCost})` })
        .from(maintenanceLogs)
        .where(and(isNull(maintenanceLogs.deletedAt), ...getDateFilters(maintenanceLogs.createdAt, from, to)))
        .groupBy(...grp.group)
        .orderBy(grp.order);
      return data.map(d => ({ label: d.label, value: Number(d.value || 0) }));
    }
    if (chartType === "fleet") {
      const data = await db
        .select({ label: vehicles.status, value: sql`count(*)` })
        .from(vehicles)
        .where(isNull(vehicles.deletedAt))
        .groupBy(vehicles.status);
      return data.map(d => ({ label: d.label, value: Number(d.value || 0) }));
    }
    return [];
  },

  getTopLists: async (listType, query) => {
    const { from, to } = query;

    if (listType === "vehicles-by-expense") {
      const list = await db
        .select({
          id: vehicles.id,
          registration_number: vehicles.registrationNumber,
          vehicle_name: vehicles.vehicleName,
          value: sql`sum(${expenses.amount})`
        })
        .from(expenses)
        .innerJoin(vehicles, eq(expenses.vehicleId, vehicles.id))
        .where(and(isNull(expenses.deletedAt), ...getDateFilters(expenses.expenseDate, from, to)))
        .groupBy(vehicles.id, vehicles.registrationNumber, vehicles.vehicleName)
        .orderBy(desc(sql`sum(${expenses.amount})`))
        .limit(5);
      return list.map(x => ({ ...x, value: Number(x.value) }));
    }

    if (listType === "vehicles-by-fuel-cost") {
      const list = await db
        .select({
          id: vehicles.id,
          registration_number: vehicles.registrationNumber,
          vehicle_name: vehicles.vehicleName,
          value: sql`sum(${expenses.amount})`
        })
        .from(expenses)
        .innerJoin(vehicles, eq(expenses.vehicleId, vehicles.id))
        .where(and(
          isNull(expenses.deletedAt),
          eq(expenses.expenseType, "Fuel"),
          ...getDateFilters(expenses.expenseDate, from, to)
        ))
        .groupBy(vehicles.id, vehicles.registrationNumber, vehicles.vehicleName)
        .orderBy(desc(sql`sum(${expenses.amount})`))
        .limit(5);
      return list.map(x => ({ ...x, value: Number(x.value) }));
    }

    if (listType === "drivers-by-distance") {
      const list = await db
        .select({
          id: drivers.id,
          full_name: drivers.fullName,
          value: sql`sum(${trips.actualDistance})`
        })
        .from(trips)
        .innerJoin(drivers, eq(trips.driverId, drivers.id))
        .where(and(
          isNull(trips.deletedAt),
          eq(trips.status, "Completed"),
          ...getDateFilters(trips.createdAt, from, to)
        ))
        .groupBy(drivers.id, drivers.fullName)
        .orderBy(desc(sql`sum(${trips.actualDistance})`))
        .limit(5);
      return list.map(x => ({ ...x, value: Number(x.value) }));
    }

    if (listType === "drivers-by-trips") {
      const list = await db
        .select({
          id: drivers.id,
          full_name: drivers.fullName,
          value: sql`count(${trips.id})`
        })
        .from(trips)
        .innerJoin(drivers, eq(trips.driverId, drivers.id))
        .where(and(
          isNull(trips.deletedAt),
          eq(trips.status, "Completed"),
          ...getDateFilters(trips.createdAt, from, to)
        ))
        .groupBy(drivers.id, drivers.fullName)
        .orderBy(desc(sql`count(${trips.id})`))
        .limit(5);
      return list.map(x => ({ ...x, value: Number(x.value) }));
    }

    if (listType === "costliest-vehicles") {
      const list = await db
        .select({
          id: vehicles.id,
          registration_number: vehicles.registrationNumber,
          vehicle_name: vehicles.vehicleName,
          value: vehicles.acquisitionCost
        })
        .from(vehicles)
        .where(isNull(vehicles.deletedAt))
        .orderBy(desc(vehicles.acquisitionCost))
        .limit(5);
      return list.map(x => ({ ...x, value: Number(x.value) }));
    }

    if (listType === "expense-categories") {
      const list = await db
        .select({
          label: expenses.expenseType,
          value: sql`sum(${expenses.amount})`
        })
        .from(expenses)
        .where(and(isNull(expenses.deletedAt), ...getDateFilters(expenses.expenseDate, from, to)))
        .groupBy(expenses.expenseType)
        .orderBy(desc(sql`sum(${expenses.amount})`))
        .limit(5);
      return list.map(x => ({ ...x, value: Number(x.value) }));
    }

    if (listType === "fuel-efficient-vehicles") {
      const list = await db
        .select({
          id: vehicles.id,
          registration_number: vehicles.registrationNumber,
          vehicle_name: vehicles.vehicleName,
          value: sql`avg(${fuelLogs.fuelEfficiency})`
        })
        .from(fuelLogs)
        .innerJoin(vehicles, eq(fuelLogs.vehicleId, vehicles.id))
        .where(and(isNull(fuelLogs.deletedAt), ...getDateFilters(fuelLogs.fuelDate, from, to)))
        .groupBy(vehicles.id, vehicles.registrationNumber, vehicles.vehicleName)
        .orderBy(desc(sql`avg(${fuelLogs.fuelEfficiency})`))
        .limit(5);
      return list.map(x => ({ ...x, value: Number(Number(x.value || 0).toFixed(2)) }));
    }

    return [];
  }
};
