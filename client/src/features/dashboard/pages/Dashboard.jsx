import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Users,
  Route,
  Wrench,
  AlertTriangle,
  Fuel,
  DollarSign,
  Calendar,
  TrendingUp,
  RefreshCw,
  Clock,
  MapPin,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import MainLayout from "../../../components/layout/MainLayout";
import dashboardService from "../service/dashboardService";
import { useAuth } from "../../auth/context/AuthContext";

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.08
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // States for API datasets
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);

  // Date Filter State
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);
    try {
      const filters = {};
      if (from) filters.from = from;
      if (to) filters.to = to;

      const [summaryRes, chartsRes, alertsRes, tripsRes] = await Promise.all([
        dashboardService.getSummary(filters),
        dashboardService.getChartData(filters),
        dashboardService.getAlerts(),
        dashboardService.getRecentTrips(5)
      ]);

      if (summaryRes.success) setSummary(summaryRes);
      if (chartsRes.success) setChartData(chartsRes.data);
      if (alertsRes.success) setAlerts(alertsRes.data);
      if (tripsRes.success) setRecentTrips(tripsRes.data);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError("Failed to fetch dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleResetFilters = () => {
    setFrom("");
    setTo("");
  };

  // Helper status styling for Trips
  const getTripStatusStyles = (status) => {
    switch (status) {
      case "Draft":
        return "bg-slate-100 text-slate-600 border border-slate-200";
      case "Dispatched":
        return "bg-indigo-50 text-indigo-700 border border-indigo-200";
      case "On Trip":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
            <p className="text-sm font-medium text-slate-500">Loading TransitOps Dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Combined counts for status panel
  const vehicleBreakdown = [
    { label: "Available", count: summary?.fleet?.availableVehicles || 0, color: "bg-emerald-500" },
    { label: "On Trip", count: summary?.fleet?.vehiclesOnTrip || 0, color: "bg-blue-500" },
    { label: "In Shop", count: summary?.fleet?.vehiclesInMaintenance || 0, color: "bg-amber-500" },
    { label: "Retired", count: (summary?.fleet?.totalVehicles || 0) - ((summary?.fleet?.availableVehicles || 0) + (summary?.fleet?.vehiclesOnTrip || 0) + (summary?.fleet?.vehiclesInMaintenance || 0)), color: "bg-slate-400" }
  ];
  if (vehicleBreakdown[3].count < 0) vehicleBreakdown[3].count = 0;

  const totalVehicles = summary?.fleet?.totalVehicles || 1;

  // Active alerts list for the UI
  const activeAlerts = [];
  if (alerts?.overdueMaintenance?.length > 0) {
    alerts.overdueMaintenance.forEach(m => {
      activeAlerts.push({
        id: `mnt-${m.id}`,
        type: "danger",
        message: `Maintenance overdue for Log #${m.maintenance_number} (${m.issue_title})`,
        meta: `Expected completion: ${new Date(m.expected_completion_date).toLocaleDateString()}`
      });
    });
  }
  if (alerts?.driverLicenseExpiring?.length > 0) {
    alerts.driverLicenseExpiring.forEach(d => {
      activeAlerts.push({
        id: `drv-${d.id}`,
        type: "warning",
        message: `License expiring soon for ${d.full_name}`,
        meta: `Expiry: ${new Date(d.license_expiry_date).toLocaleDateString()} (${d.license_number})`
      });
    });
  }
  if (alerts?.vehiclesDueForMaintenance?.length > 0) {
    alerts.vehiclesDueForMaintenance.forEach(v => {
      activeAlerts.push({
        id: `veh-${v.id}`,
        type: "info",
        message: `Vehicle in shop: ${v.registration_number} - ${v.vehicle_name}`,
        meta: "Status: In Shop"
      });
    });
  }

  return (
    <MainLayout>
      <motion.div
        className="space-y-6 pb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">
              Welcome, {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : (user?.email?.split("@")[0] || "Fleet Manager")}!
            </h1>
            <p className="mt-2 text-slate-500">
              Here is your TransitOps real-time logistics and maintenance breakdown overview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchDashboardData(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Syncing..." : "Sync Logs"}
            </button>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Filter Date Range:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              />
              <span className="text-slate-400 text-sm">to</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            {(from || to) && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-orange-500 hover:text-orange-600 hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Data aggregates dynamically based on filters
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2 shadow-sm">
            <ShieldAlert className="h-5 w-5 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* KPI metrics grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* Active Fleet */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.01, boxShadow: "0 12px 20px -3px rgba(249, 115, 22, 0.08)" }}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 border-l-4 border-l-orange-500 bg-white p-6 shadow-sm transition duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-xs font-semibold tracking-wider uppercase">Active Fleet</p>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-2">
                  {summary?.fleet?.totalVehicles || 0}
                </h3>
              </div>
              <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                <Truck className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
              <span className="text-emerald-600 font-semibold">{summary?.fleet?.availableVehicles || 0} Free</span>
              <span>•</span>
              <span className="text-blue-600 font-semibold">{summary?.fleet?.vehiclesOnTrip || 0} Active</span>
            </div>
          </motion.div>

          {/* Active Trips */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.01, boxShadow: "0 12px 20px -3px rgba(59, 130, 246, 0.08)" }}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 border-l-4 border-l-blue-500 bg-white p-6 shadow-sm transition duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-xs font-semibold tracking-wider uppercase">Active Trips</p>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-2">
                  {summary?.trips?.activeTrips || 0}
                </h3>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Route className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{summary?.trips?.completedTrips || 0} completed</span>
              <span className="font-semibold text-slate-700">+{summary?.trips?.todayTrips || 0} Today</span>
            </div>
          </motion.div>

          {/* Maintenance Logs */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.01, boxShadow: "0 12px 20px -3px rgba(245, 158, 11, 0.08)" }}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 border-l-4 border-l-amber-500 bg-white p-6 shadow-sm transition duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-xs font-semibold tracking-wider uppercase">In Shop</p>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-2">
                  {summary?.fleet?.vehiclesInMaintenance || 0}
                </h3>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Wrench className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{summary?.maintenance?.inProgress || 0} in progress</span>
              {summary?.maintenance?.overdue > 0 ? (
                <span className="font-semibold text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {summary.maintenance.overdue} Overdue
                </span>
              ) : (
                <span className="text-slate-400">0 overdue</span>
              )}
            </div>
          </motion.div>

          {/* Drivers On Duty */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.01, boxShadow: "0 12px 20px -3px rgba(99, 102, 241, 0.08)" }}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 border-l-4 border-l-indigo-500 bg-white p-6 shadow-sm transition duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-xs font-semibold tracking-wider uppercase">Drivers Duty</p>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-2">
                  {summary?.drivers?.totalDrivers || 0}
                </h3>
              </div>
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-emerald-600 font-semibold">{summary?.drivers?.availableDrivers || 0} Available</span>
              <span>•</span>
              <span className="text-indigo-600 font-semibold">{summary?.drivers?.driversOnTrip || 0} On Road</span>
            </div>
          </motion.div>

          {/* Fuel Stats */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.01, boxShadow: "0 12px 20px -3px rgba(14, 165, 233, 0.08)" }}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 border-l-4 border-l-sky-500 bg-white p-6 shadow-sm transition duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-xs font-semibold tracking-wider uppercase">Fuel Consumed</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-2">
                  {summary?.fuel?.totalFuelConsumed ? `${summary.fuel.totalFuelConsumed} L` : "0 L"}
                </h3>
              </div>
              <div className="rounded-xl bg-sky-50 p-3 text-sky-600">
                <Fuel className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Avg Efficiency</span>
              <span className="font-semibold text-slate-700">{summary?.fuel?.averageFuelEfficiency || 0} km/L</span>
            </div>
          </motion.div>

          {/* Expenses stats */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.01, boxShadow: "0 12px 20px -3px rgba(16, 185, 129, 0.08)" }}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 border-l-4 border-l-emerald-500 bg-white p-6 shadow-sm transition duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-xs font-semibold tracking-wider uppercase">Total Expenses</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-2">
                  ${summary?.expenses?.totalOperationalCost || 0}
                </h3>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Fuel Cost</span>
              <span className="font-semibold text-rose-500">${summary?.expenses?.fuelCost || 0}</span>
            </div>
          </motion.div>
        </div>

        {/* Charts section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Monthly Trips Trend */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Monthly Trip Distributions</h3>
                <p className="text-xs text-slate-400">Showing count trend of completed & active trips</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+12.4% MoM</span>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData?.monthlyTrips || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Trips Completed"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorTrips)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Fuel vs General Expenses */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Operational Expenditures</h3>
                <p className="text-xs text-slate-400">Monthly breakdown of fuel logistics vs maintenance expenses</p>
              </div>
              <div className="text-xs text-slate-400 font-semibold">
                Amounts in USD
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData?.monthlyExpenses || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: "#475569" }} />
                  <Bar
                    dataKey="amount"
                    name="Maintenance & Other Costs"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Real-time Alerts, Vehicle Status & Recent Trips */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Critical Alerts panel */}
          <motion.div
            variants={cardVariants}
            className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">Critical Warnings</h3>
                <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">
                  {activeAlerts.length} Active
                </span>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-80 pr-1">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-xl border p-3 text-xs flex gap-3 ${
                      alert.type === "danger"
                        ? "bg-rose-50 border-rose-100 text-rose-800"
                        : alert.type === "warning"
                        ? "bg-amber-50 border-amber-100 text-amber-800"
                        : "bg-blue-50 border-blue-100 text-blue-800"
                    }`}
                  >
                    <div className="mt-0.5">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold leading-tight">{alert.message}</p>
                      <p className="mt-1 text-[10px] text-slate-400 font-medium">{alert.meta}</p>
                    </div>
                  </div>
                ))}

                {activeAlerts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                    <ShieldAlert className="h-10 w-10 text-slate-300 mb-2" />
                    <p className="text-sm font-semibold">All systems nominal</p>
                    <p className="text-xs">No active vehicle or license alerts found.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Vehicle status progress breakdown */}
          <motion.div
            variants={cardVariants}
            className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Vehicle Fleet Status</h3>
              <span className="text-xs font-semibold text-slate-400">Real-time status breakdown</span>
            </div>

            <div className="space-y-4 py-2">
              {vehicleBreakdown.map(({ label, count, color }) => {
                const percentage = totalVehicles > 0 ? (count / totalVehicles) * 100 : 0;
                return (
                  <div key={label} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium text-slate-600">
                      <span>{label}</span>
                      <span className="font-semibold text-slate-800">{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className={`${color} h-2.5 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Trips */}
          <motion.div
            variants={cardVariants}
            className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Recent Assignments</h3>
              <a href="/trips" className="text-xs font-bold text-orange-500 hover:text-orange-600 hover:underline flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>

            <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
              {recentTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-50 transition duration-200"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">#{trip.trip_number || "TRIP-LOG"}</span>
                    <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${getTripStatusStyles(trip.status)}`}>
                      {trip.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span>{trip.source}</span>
                      <ArrowRight className="h-2.5 w-2.5 mx-0.5 text-slate-400" />
                      <span>{trip.destination}</span>
                    </div>
                    {trip.driver && (
                      <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 border border-slate-150 rounded">
                        {trip.driver.full_name}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {recentTrips.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                  <Route className="h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-sm font-semibold">No recent trips</p>
                  <p className="text-xs">Assignments will appear here once dispatched.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Dashboard;