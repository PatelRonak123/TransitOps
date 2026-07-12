import { db } from "../../config/dbConfig.js";
import { vehicles } from "../vehicle/vehicleModel.js";
import { drivers } from "../driver/driverModel.js";
import { trips } from "../trip/tripModel.js";
import { maintenanceLogs } from "../maintenance/maintenanceModel.js";
import { fuelLogs } from "../fuel/fuelModel.js";
import { expenses } from "../expense/expenseModel.js";
import { eq, and, isNull, sql, notInArray, lt, gte, lte, desc, asc, inArray } from "drizzle-orm";

const getDateFilters = (column, from, to) => {
  const filters = [];
  if (from) {
    filters.push(sql`date(${column}) >= ${from}`);
  }
  if (to) {
    filters.push(sql`date(${column}) <= ${to}`);
  }
  return filters;
};

export const dashboardService = {
  getDashboardSummary: async (from, to) => {
    // 1. Fleet status counts
    const fleetList = await db
      .select({ status: vehicles.status })
      .from(vehicles)
      .where(and(isNull(vehicles.deletedAt), ...getDateFilters(vehicles.createdAt, from, to)));

    let totalVehicles = fleetList.length;
    let availableVehicles = 0;
    let vehiclesOnTrip = 0;
    let vehiclesInMaintenance = 0;

    for (const v of fleetList) {
      if (v.status === "Available") availableVehicles++;
      else if (v.status === "On Trip") vehiclesOnTrip++;
      else if (v.status === "In Shop") vehiclesInMaintenance++;
    }

    // 2. Driver status counts
    const driverList = await db
      .select({ status: drivers.status })
      .from(drivers)
      .where(and(isNull(drivers.deletedAt), ...getDateFilters(drivers.createdAt, from, to)));

    let totalDrivers = driverList.length;
    let availableDrivers = 0;
    let driversOnTrip = 0;

    for (const d of driverList) {
      if (d.status === "Available") availableDrivers++;
      else if (d.status === "On Trip") driversOnTrip++;
    }

    // 3. Trips status counts
    const tripList = await db
      .select({ status: trips.status, createdAt: trips.createdAt })
      .from(trips)
      .where(and(isNull(trips.deletedAt), ...getDateFilters(trips.createdAt, from, to)));

    let activeTrips = 0;
    let completedTrips = 0;
    let cancelledTrips = 0;
    let todayTrips = 0;
    const todayStr = new Date().toISOString().split("T")[0];

    for (const t of tripList) {
      if (t.status === "Dispatched") activeTrips++;
      else if (t.status === "Completed") completedTrips++;
      else if (t.status === "Cancelled") cancelledTrips++;

      const createdStr = new Date(t.createdAt).toISOString().split("T")[0];
      if (createdStr === todayStr) todayTrips++;
    }

    // 4. Maintenance status counts
    const mntList = await db
      .select({ status: maintenanceLogs.status, expectedCompletionDate: maintenanceLogs.expectedCompletionDate })
      .from(maintenanceLogs)
      .where(and(isNull(maintenanceLogs.deletedAt), ...getDateFilters(maintenanceLogs.createdAt, from, to)));

    let scheduled = 0;
    let inProgress = 0;
    let completed = 0;
    let overdue = 0;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    for (const m of mntList) {
      if (m.status === "Open") scheduled++;
      else if (m.status === "In Progress") inProgress++;
      else if (m.status === "Completed") completed++;

      if (m.status !== "Completed" && m.status !== "Cancelled" && m.expectedCompletionDate) {
        const expDate = new Date(m.expectedCompletionDate);
        if (expDate < todayDate) overdue++;
      }
    }

    // 5. Fuel aggregates
    const fuelList = await db
      .select({ liters: fuelLogs.liters, totalCost: fuelLogs.totalCost, fuelEfficiency: fuelLogs.fuelEfficiency })
      .from(fuelLogs)
      .where(and(isNull(fuelLogs.deletedAt), ...getDateFilters(fuelLogs.fuelDate, from, to)));

    let totalFuelConsumed = 0;
    let totalFuelCost = 0;
    let efficiencySum = 0;
    let efficiencyCount = 0;

    for (const f of fuelList) {
      totalFuelConsumed += Number(f.liters || 0);
      totalFuelCost += Number(f.totalCost || 0);
      if (f.fuelEfficiency !== null && f.fuelEfficiency !== undefined) {
        efficiencySum += Number(f.fuelEfficiency);
        efficiencyCount++;
      }
    }
    const averageFuelEfficiency = efficiencyCount > 0 ? efficiencySum / efficiencyCount : 0;

    // 6. Expenses aggregates
    const expenseList = await db
      .select({ expenseType: expenses.expenseType, amount: expenses.amount })
      .from(expenses)
      .where(and(isNull(expenses.deletedAt), ...getDateFilters(expenses.expenseDate, from, to)));

    let maintenanceCost = 0;
    let fuelCost = 0;
    let otherExpense = 0;
    let totalOperationalCost = 0;

    for (const e of expenseList) {
      const amt = Number(e.amount || 0);
      totalOperationalCost += amt;

      if (e.expenseType === "Fuel") {
        fuelCost += amt;
      } else if (e.expenseType === "Maintenance" || e.expenseType === "Repair") {
        maintenanceCost += amt;
      } else {
        otherExpense += amt;
      }
    }

    return {
      fleet: {
        totalVehicles,
        availableVehicles,
        vehiclesOnTrip,
        vehiclesInMaintenance
      },
      drivers: {
        totalDrivers,
        availableDrivers,
        driversOnTrip
      },
      trips: {
        activeTrips,
        completedTrips,
        cancelledTrips,
        todayTrips
      },
      maintenance: {
        scheduled,
        inProgress,
        completed,
        overdue
      },
      fuel: {
        totalFuelConsumed: Number(totalFuelConsumed.toFixed(2)),
        totalFuelCost: Number(totalFuelCost.toFixed(2)),
        averageFuelEfficiency: Number(averageFuelEfficiency.toFixed(2))
      },
      expenses: {
        maintenanceCost: Number(maintenanceCost.toFixed(2)),
        fuelCost: Number(fuelCost.toFixed(2)),
        otherExpense: Number(otherExpense.toFixed(2)),
        totalOperationalCost: Number(totalOperationalCost.toFixed(2))
      }
    };
  },

  getFleetKPIs: async (from, to) => {
    const fleetList = await db
      .select()
      .from(vehicles)
      .where(and(isNull(vehicles.deletedAt), ...getDateFilters(vehicles.createdAt, from, to)));

    let totalVehicles = fleetList.length;
    let availableVehicles = 0;
    let vehiclesOnTrip = 0;
    let vehiclesInMaintenance = 0;
    let retiredVehicles = 0;
    
    const statusBreakdown = {};
    const typeBreakdown = {};
    let odometerSum = 0;

    for (const v of fleetList) {
      odometerSum += Number(v.odometer || 0);
      statusBreakdown[v.status] = (statusBreakdown[v.status] || 0) + 1;
      typeBreakdown[v.vehicleType] = (typeBreakdown[v.vehicleType] || 0) + 1;

      if (v.status === "Available") availableVehicles++;
      else if (v.status === "On Trip") vehiclesOnTrip++;
      else if (v.status === "In Shop") vehiclesInMaintenance++;
      else if (v.status === "Retired") retiredVehicles++;
    }

    const averageOdometer = totalVehicles > 0 ? odometerSum / totalVehicles : 0;

    return {
      totalVehicles,
      availableVehicles,
      vehiclesOnTrip,
      vehiclesInMaintenance,
      retiredVehicles,
      averageOdometer: Number(averageOdometer.toFixed(2)),
      statusBreakdown,
      typeBreakdown
    };
  },

  getTripKPIs: async (from, to) => {
    const tripList = await db
      .select()
      .from(trips)
      .where(and(isNull(trips.deletedAt), ...getDateFilters(trips.createdAt, from, to)));

    let totalTrips = tripList.length;
    let activeTrips = 0;
    let completedTrips = 0;
    let cancelledTrips = 0;
    let draftTrips = 0;
    let todayTrips = 0;
    const todayStr = new Date().toISOString().split("T")[0];

    let plannedDistanceSum = 0;
    let actualDistanceSum = 0;
    let revenueSum = 0;

    for (const t of tripList) {
      plannedDistanceSum += Number(t.plannedDistance || 0);
      actualDistanceSum += Number(t.actualDistance || 0);
      revenueSum += Number(t.revenue || 0);

      if (t.status === "Dispatched") activeTrips++;
      else if (t.status === "Completed") completedTrips++;
      else if (t.status === "Cancelled") cancelledTrips++;
      else if (t.status === "Draft") draftTrips++;

      const createdStr = new Date(t.createdAt).toISOString().split("T")[0];
      if (createdStr === todayStr) todayTrips++;
    }

    const averageRevenuePerTrip = completedTrips > 0 ? revenueSum / completedTrips : 0;
    const averageDistancePerTrip = completedTrips > 0 ? actualDistanceSum / completedTrips : 0;

    return {
      activeTrips,
      completedTrips,
      cancelledTrips,
      draftTrips,
      todayTrips,
      totalTrips,
      totalPlannedDistance: Number(plannedDistanceSum.toFixed(2)),
      totalActualDistance: Number(actualDistanceSum.toFixed(2)),
      totalRevenue: Number(revenueSum.toFixed(2)),
      averageRevenuePerTrip: Number(averageRevenuePerTrip.toFixed(2)),
      averageDistancePerTrip: Number(averageDistancePerTrip.toFixed(2))
    };
  },

  getFinancialKPIs: async (from, to) => {
    const completedTripsRevenue = await db
      .select({ revenue: trips.revenue })
      .from(trips)
      .where(and(eq(trips.status, "Completed"), isNull(trips.deletedAt), ...getDateFilters(trips.createdAt, from, to)));

    let revenue = 0;
    for (const t of completedTripsRevenue) {
      revenue += Number(t.revenue || 0);
    }

    const expenseList = await db
      .select({ expenseType: expenses.expenseType, amount: expenses.amount })
      .from(expenses)
      .where(and(isNull(expenses.deletedAt), ...getDateFilters(expenses.expenseDate, from, to)));

    let fuelCost = 0;
    let maintenanceCost = 0;
    let expenseCost = 0;
    let operationalCost = 0;

    for (const e of expenseList) {
      const amt = Number(e.amount || 0);
      operationalCost += amt;

      if (e.expenseType === "Fuel") {
        fuelCost += amt;
      } else if (e.expenseType === "Maintenance" || e.expenseType === "Repair") {
        maintenanceCost += amt;
      } else {
        expenseCost += amt;
      }
    }

    return {
      revenue: Number(revenue.toFixed(2)),
      fuelCost: Number(fuelCost.toFixed(2)),
      maintenanceCost: Number(maintenanceCost.toFixed(2)),
      expenseCost: Number(expenseCost.toFixed(2)),
      operationalCost: Number(operationalCost.toFixed(2))
    };
  },

  getChartData: async (from, to) => {
    const tripsQuery = await db
      .select({
        month: sql`to_char(${trips.createdAt}, 'Mon')`,
        monthOrder: sql`to_char(${trips.createdAt}, 'MM')`,
        count: sql`count(*)`
      })
      .from(trips)
      .where(and(isNull(trips.deletedAt), ...getDateFilters(trips.createdAt, from, to)))
      .groupBy(sql`to_char(${trips.createdAt}, 'Mon')`, sql`to_char(${trips.createdAt}, 'MM')`)
      .orderBy(sql`to_char(${trips.createdAt}, 'MM')`);

    const fuelQuery = await db
      .select({
        month: sql`to_char(${fuelLogs.fuelDate}, 'Mon')`,
        monthOrder: sql`to_char(${fuelLogs.fuelDate}, 'MM')`,
        cost: sql`sum(${fuelLogs.totalCost})`
      })
      .from(fuelLogs)
      .where(and(isNull(fuelLogs.deletedAt), ...getDateFilters(fuelLogs.fuelDate, from, to)))
      .groupBy(sql`to_char(${fuelLogs.fuelDate}, 'Mon')`, sql`to_char(${fuelLogs.fuelDate}, 'MM')`)
      .orderBy(sql`to_char(${fuelLogs.fuelDate}, 'MM')`);

    const expenseQuery = await db
      .select({
        month: sql`to_char(${expenses.expenseDate}, 'Mon')`,
        monthOrder: sql`to_char(${expenses.expenseDate}, 'MM')`,
        amount: sql`sum(${expenses.amount})`
      })
      .from(expenses)
      .where(and(isNull(expenses.deletedAt), ...getDateFilters(expenses.expenseDate, from, to)))
      .groupBy(sql`to_char(${expenses.expenseDate}, 'Mon')`, sql`to_char(${expenses.expenseDate}, 'MM')`)
      .orderBy(sql`to_char(${expenses.expenseDate}, 'MM')`);

    return {
      monthlyTrips: tripsQuery.map(t => ({ month: t.month, count: Number(t.count) })),
      monthlyFuelCost: fuelQuery.map(f => ({ month: f.month, cost: Number(f.cost || 0) })),
      monthlyExpenses: expenseQuery.map(e => ({ month: e.month, amount: Number(e.amount || 0) }))
    };
  },

  getTopVehicles: async (from, to) => {
    const highestFuelCost = await db
      .select({
        vehicle_id: expenses.vehicleId,
        registration_number: vehicles.registrationNumber,
        vehicle_name: vehicles.vehicleName,
        amount: sql`sum(${expenses.amount})`
      })
      .from(expenses)
      .innerJoin(vehicles, eq(expenses.vehicleId, vehicles.id))
      .where(and(
        isNull(expenses.deletedAt),
        eq(expenses.expenseType, "Fuel"),
        ...getDateFilters(expenses.expenseDate, from, to)
      ))
      .groupBy(expenses.vehicleId, vehicles.registrationNumber, vehicles.vehicleName)
      .orderBy(desc(sql`sum(${expenses.amount})`))
      .limit(5);

    const highestMaintenanceCost = await db
      .select({
        vehicle_id: expenses.vehicleId,
        registration_number: vehicles.registrationNumber,
        vehicle_name: vehicles.vehicleName,
        amount: sql`sum(${expenses.amount})`
      })
      .from(expenses)
      .innerJoin(vehicles, eq(expenses.vehicleId, vehicles.id))
      .where(and(
        isNull(expenses.deletedAt),
        inArray(expenses.expenseType, ["Maintenance", "Repair"]),
        ...getDateFilters(expenses.expenseDate, from, to)
      ))
      .groupBy(expenses.vehicleId, vehicles.registrationNumber, vehicles.vehicleName)
      .orderBy(desc(sql`sum(${expenses.amount})`))
      .limit(5);

    const highestTotalExpense = await db
      .select({
        vehicle_id: expenses.vehicleId,
        registration_number: vehicles.registrationNumber,
        vehicle_name: vehicles.vehicleName,
        amount: sql`sum(${expenses.amount})`
      })
      .from(expenses)
      .innerJoin(vehicles, eq(expenses.vehicleId, vehicles.id))
      .where(and(
        isNull(expenses.deletedAt),
        ...getDateFilters(expenses.expenseDate, from, to)
      ))
      .groupBy(expenses.vehicleId, vehicles.registrationNumber, vehicles.vehicleName)
      .orderBy(desc(sql`sum(${expenses.amount})`))
      .limit(5);

    return {
      highestFuelCost: highestFuelCost.map(v => ({ ...v, amount: Number(v.amount) })),
      highestMaintenanceCost: highestMaintenanceCost.map(v => ({ ...v, amount: Number(v.amount) })),
      highestTotalExpense: highestTotalExpense.map(v => ({ ...v, amount: Number(v.amount) }))
    };
  },

  getAlerts: async () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + 30);
    const limitStr = limitDate.toISOString().split("T")[0];

    // Expiring driver license
    const driverLicenseExpiring = await db
      .select({
        id: drivers.id,
        fullName: drivers.fullName,
        licenseNumber: drivers.licenseNumber,
        licenseExpiryDate: drivers.licenseExpiryDate
      })
      .from(drivers)
      .where(and(
        isNull(drivers.deletedAt),
        gte(drivers.licenseExpiryDate, todayStr),
        lte(drivers.licenseExpiryDate, limitStr)
      ));

    // Overdue maintenance logs
    const overdueMaintenance = await db
      .select({
        id: maintenanceLogs.id,
        maintenanceNumber: maintenanceLogs.maintenanceNumber,
        issueTitle: maintenanceLogs.issueTitle,
        expectedCompletionDate: maintenanceLogs.expectedCompletionDate,
        status: maintenanceLogs.status
      })
      .from(maintenanceLogs)
      .where(and(
        isNull(maintenanceLogs.deletedAt),
        notInArray(maintenanceLogs.status, ["Completed", "Cancelled"]),
        lt(maintenanceLogs.expectedCompletionDate, todayStr)
      ));

    // Vehicles due for maintenance (vehicles currently in shop)
    const vehiclesDueForMaintenance = await db
      .select({
        id: vehicles.id,
        registrationNumber: vehicles.registrationNumber,
        vehicleName: vehicles.vehicleName,
        status: vehicles.status
      })
      .from(vehicles)
      .where(and(
        isNull(vehicles.deletedAt),
        eq(vehicles.status, "In Shop")
      ));

    return {
      vehiclesDueForMaintenance: vehiclesDueForMaintenance.map(v => ({
        id: v.id,
        registration_number: v.registrationNumber,
        vehicle_name: v.vehicleName,
        status: v.status
      })),
      insuranceExpiring: [],
      registrationExpiring: [],
      driverLicenseExpiring: driverLicenseExpiring.map(d => ({
        id: d.id,
        full_name: d.fullName,
        license_number: d.licenseNumber,
        license_expiry_date: d.licenseExpiryDate
      })),
      overdueMaintenance: overdueMaintenance.map(m => ({
        id: m.id,
        maintenance_number: m.maintenanceNumber,
        issue_title: m.issueTitle,
        expected_completion_date: m.expectedCompletionDate,
        status: m.status
      }))
    };
  },

  searchSystem: async (query) => {
    if (!query) return { vehicles: [], drivers: [], trips: [] };
    const cleanQuery = `%${query}%`;

    // Search Vehicles
    const vehiclesResult = await db
      .select({
        id: vehicles.id,
        vehicleName: vehicles.vehicleName,
        registrationNumber: vehicles.registrationNumber,
        status: vehicles.status
      })
      .from(vehicles)
      .where(
        and(
          isNull(vehicles.deletedAt),
          sql`(${vehicles.vehicleName} ILIKE ${cleanQuery} OR ${vehicles.registrationNumber} ILIKE ${cleanQuery} OR ${vehicles.vehicleModel} ILIKE ${cleanQuery})`
        )
      )
      .limit(5);

    // Search Drivers
    const driversResult = await db
      .select({
        id: drivers.id,
        fullName: drivers.fullName,
        contactNumber: drivers.contactNumber,
        status: drivers.status
      })
      .from(drivers)
      .where(
        and(
          isNull(drivers.deletedAt),
          sql`(${drivers.fullName} ILIKE ${cleanQuery} OR ${drivers.contactNumber} ILIKE ${cleanQuery})`
        )
      )
      .limit(5);

    // Search Trips
    const tripsResult = await db
      .select({
        id: trips.id,
        tripNumber: trips.tripNumber,
        source: trips.source,
        destination: trips.destination,
        status: trips.status
      })
      .from(trips)
      .where(
        and(
          isNull(trips.deletedAt),
          sql`(${trips.tripNumber} ILIKE ${cleanQuery} OR ${trips.source} ILIKE ${cleanQuery} OR ${trips.destination} ILIKE ${cleanQuery})`
        )
      )
      .limit(5);

    return {
      vehicles: vehiclesResult,
      drivers: driversResult,
      trips: tripsResult
    };
  }
};
