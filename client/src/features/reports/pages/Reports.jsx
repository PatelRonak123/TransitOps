import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Calendar,
  Search,
  RefreshCw,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  IndianRupee,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import MainLayout from "../../../components/layout/MainLayout";
import reportService from "../service/reportService";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";

const reportCategories = [
  { id: "vehicles", label: "Vehicles", icon: <Truck className="h-4 w-4" /> },
  { id: "drivers", label: "Drivers", icon: <Users className="h-4 w-4" /> },
  { id: "trips", label: "Trips", icon: <Route className="h-4 w-4" /> },
  { id: "fuel", label: "Fuel Logs", icon: <Fuel className="h-4 w-4" /> },
  { id: "maintenance", label: "Maintenance", icon: <Wrench className="h-4 w-4" /> },
  { id: "expenses", label: "Expenses", icon: <IndianRupee className="h-4 w-4" /> }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const Reports = () => {
  const [activeTab, setActiveTab] = useState("vehicles");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null); // 'pdf', 'excel', 'csv'
  const [error, setError] = useState(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Filter States
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Response Data
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = { page, limit };
      if (from) filters.from = from;
      if (to) filters.to = to;
      if (search) filters.search = search;

      const response = await reportService.getReport(activeTab, filters);
      if (response.success) {
        setReportData(response.data || []);
        setSummary(response.summary || null);
        setPagination(response.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
      } else {
        setError(response.message || "Failed to fetch report data.");
      }
    } catch (err) {
      console.error("Report Fetch Error:", err);
      setError("Unable to connect to reports service.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, from, to, search, page, limit]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const filters = {};
      if (from) filters.from = from;
      if (to) filters.to = to;
      if (search) filters.search = search;

      const blobData = await reportService.exportReport(activeTab, format, filters);
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${activeTab}_report_${new Date().toISOString().split("T")[0]}.${format === "excel" ? "xlsx" : format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export Error:", err);
      setErrorMessage("Failed to export report. Please try again.");
      setErrorModalOpen(true);
    } finally {
      setExporting(null);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPage(1);
    setSearch("");
  };

  const handleResetFilters = () => {
    setFrom("");
    setTo("");
    setSearch("");
    setPage(1);
  };

  // Dynamically render header columns based on selected report category
  const renderHeaders = () => {
    switch (activeTab) {
      case "vehicles":
        return (
          <>
            <th className="px-6 py-3 text-left font-medium">Reg Number</th>
            <th className="px-6 py-3 text-left font-medium">Name</th>
            <th className="px-6 py-3 text-left font-medium">Model</th>
            <th className="px-6 py-3 text-left font-medium">Type</th>
            <th className="px-6 py-3 text-left font-medium">Odometer</th>
            <th className="px-6 py-3 text-left font-medium">Status</th>
          </>
        );
      case "drivers":
        return (
          <>
            <th className="px-6 py-3 text-left font-medium">Name</th>
            <th className="px-6 py-3 text-left font-medium">License Class</th>
            <th className="px-6 py-3 text-left font-medium">License Expiry</th>
            <th className="px-6 py-3 text-left font-medium">Contact</th>
            <th className="px-6 py-3 text-left font-medium">Score</th>
            <th className="px-6 py-3 text-left font-medium">Status</th>
          </>
        );
      case "trips":
        return (
          <>
            <th className="px-6 py-3 text-left font-medium">Trip No</th>
            <th className="px-6 py-3 text-left font-medium">Vehicle</th>
            <th className="px-6 py-3 text-left font-medium">Driver</th>
            <th className="px-6 py-3 text-left font-medium">Route</th>
            <th className="px-6 py-3 text-left font-medium">Distance</th>
            <th className="px-6 py-3 text-left font-medium">Status</th>
          </>
        );
      case "fuel":
        return (
          <>
            <th className="px-6 py-3 text-left font-medium">Log No</th>
            <th className="px-6 py-3 text-left font-medium">Vehicle</th>
            <th className="px-6 py-3 text-left font-medium">Liters</th>
            <th className="px-6 py-3 text-left font-medium">Total Cost</th>
            <th className="px-6 py-3 text-left font-medium">Station</th>
            <th className="px-6 py-3 text-left font-medium">Date</th>
          </>
        );
      case "maintenance":
        return (
          <>
            <th className="px-6 py-3 text-left font-medium">Log No</th>
            <th className="px-6 py-3 text-left font-medium">Vehicle</th>
            <th className="px-6 py-3 text-left font-medium">Type</th>
            <th className="px-6 py-3 text-left font-medium">Cost</th>
            <th className="px-6 py-3 text-left font-medium">Priority</th>
            <th className="px-6 py-3 text-left font-medium">Status</th>
          </>
        );
      case "expenses":
        return (
          <>
            <th className="px-6 py-3 text-left font-medium">Expense No</th>
            <th className="px-6 py-3 text-left font-medium">Category</th>
            <th className="px-6 py-3 text-left font-medium">Description</th>
            <th className="px-6 py-3 text-left font-medium">Amount</th>
            <th className="px-6 py-3 text-left font-medium">Status</th>
            <th className="px-6 py-3 text-left font-medium">Date</th>
          </>
        );
      default:
        return null;
    }
  };

  // Dynamically render data rows based on selected report category
  const renderRow = (row) => {
    switch (activeTab) {
      case "vehicles":
        return (
          <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
            <td className="px-6 py-4 font-semibold text-slate-700">{row.registration_number || row.registrationNumber}</td>
            <td className="px-6 py-4 text-slate-600">{row.vehicle_name || row.vehicleName}</td>
            <td className="px-6 py-4 text-slate-600">{row.vehicle_model || row.vehicleModel}</td>
            <td className="px-6 py-4 text-slate-500">{row.vehicle_type || row.vehicleType}</td>
            <td className="px-6 py-4 text-slate-700 font-medium">{(row.odometer || 0).toLocaleString()} km</td>
            <td className="px-6 py-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                row.status === "Available" ? "bg-emerald-50 text-emerald-700" :
                row.status === "On Trip" ? "bg-blue-50 text-blue-700" :
                row.status === "In Shop" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"
              }`}>
                {row.status}
              </span>
            </td>
          </tr>
        );
      case "drivers":
        return (
          <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
            <td className="px-6 py-4 font-semibold text-slate-700">{row.fullName || row.full_name}</td>
            <td className="px-6 py-4 text-slate-500 font-medium">{row.licenseCategory || row.license_category}</td>
            <td className="px-6 py-4 text-slate-600">{row.licenseExpiryDate ? new Date(row.licenseExpiryDate).toLocaleDateString() : "-"}</td>
            <td className="px-6 py-4 text-slate-600">{row.contactNumber || row.contact_number}</td>
            <td className="px-6 py-4 text-slate-700 font-bold">{row.safetyScore || row.safety_score || 0}</td>
            <td className="px-6 py-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                row.status === "Available" ? "bg-emerald-50 text-emerald-700" :
                row.status === "On Trip" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
              }`}>
                {row.status}
              </span>
            </td>
          </tr>
        );
      case "trips":
        return (
          <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
            <td className="px-6 py-4 font-semibold text-slate-700">#{row.tripNumber || row.trip_number}</td>
            <td className="px-6 py-4 text-slate-600">{row.vehicle?.registration_number || "-"}</td>
            <td className="px-6 py-4 text-slate-600">{row.driver?.full_name || "-"}</td>
            <td className="px-6 py-4 text-slate-500">
              <span className="font-medium text-slate-700">{row.source}</span>
              <span className="mx-2 text-slate-400">→</span>
              <span className="font-medium text-slate-700">{row.destination}</span>
            </td>
            <td className="px-6 py-4 text-slate-700 font-medium">{row.actual_distance || row.planned_distance || 0} km</td>
            <td className="px-6 py-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                row.status === "Completed" ? "bg-emerald-50 text-emerald-700" :
                row.status === "On Trip" ? "bg-blue-50 text-blue-700" :
                row.status === "Dispatched" ? "bg-indigo-50 text-indigo-700" :
                row.status === "Cancelled" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"
              }`}>
                {row.status}
              </span>
            </td>
          </tr>
        );
      case "fuel":
        return (
          <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
            <td className="px-6 py-4 font-semibold text-slate-700">#{row.fuel_log_number || row.fuelLogNumber}</td>
            <td className="px-6 py-4 text-slate-600">{row.vehicle?.registration_number || "-"}</td>
            <td className="px-6 py-4 text-slate-600 font-medium">{row.liters} L</td>
            <td className="px-6 py-4 text-emerald-600 font-semibold">₹{row.total_cost || row.totalCost || 0}</td>
            <td className="px-6 py-4 text-slate-500">{row.fuel_station || row.fuelStation}</td>
            <td className="px-6 py-4 text-slate-600">{new Date(row.fuel_date || row.fuelDate).toLocaleDateString()}</td>
          </tr>
        );
      case "maintenance":
        return (
          <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
            <td className="px-6 py-4 font-semibold text-slate-700">#{row.maintenance_number || row.maintenanceNumber}</td>
            <td className="px-6 py-4 text-slate-600">{row.vehicle?.registration_number || "-"}</td>
            <td className="px-6 py-4 text-slate-500">{row.maintenance_type || row.maintenanceType}</td>
            <td className="px-6 py-4 text-emerald-600 font-semibold">₹{row.actual_cost || row.estimated_cost || 0}</td>
            <td className="px-6 py-4">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                row.priority === "High" ? "bg-rose-50 text-rose-700" :
                row.priority === "Medium" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700"
              }`}>
                {row.priority}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                row.status === "Completed" ? "bg-emerald-50 text-emerald-700" :
                row.status === "In Progress" ? "bg-blue-50 text-blue-700" :
                row.status === "Cancelled" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"
              }`}>
                {row.status}
              </span>
            </td>
          </tr>
        );
      case "expenses":
        return (
          <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
            <td className="px-6 py-4 font-semibold text-slate-700">#{row.expense_number || row.expenseNumber}</td>
            <td className="px-6 py-4 text-slate-500 font-medium">{row.expense_type || row.expenseType}</td>
            <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{row.title}</td>
            <td className="px-6 py-4 text-emerald-600 font-bold">₹{row.amount}</td>
            <td className="px-6 py-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                row.payment_status === "Paid" ? "bg-emerald-50 text-emerald-700" :
                row.payment_status === "Pending" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
              }`}>
                {row.payment_status}
              </span>
            </td>
            <td className="px-6 py-4 text-slate-600">{new Date(row.expense_date || row.expenseDate).toLocaleDateString()}</td>
          </tr>
        );
      default:
        return null;
    }
  };

  // Helper to render active tab summary metrics
  const renderSummaryCards = () => {
    if (!summary) return null;
    switch (activeTab) {
      case "vehicles":
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Fleet Size</p>
              <p className="mt-2 text-2xl font-bold text-slate-800">{summary.totalVehicles || 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Fleet</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">{summary.availableVehicles || 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">On Active Trips</p>
              <p className="mt-2 text-2xl font-bold text-blue-600">{summary.onTrip || 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Maintenance</p>
              <p className="mt-2 text-2xl font-bold text-amber-600">{summary.inShop || 0}</p>
            </div>
          </div>
        );
      case "drivers":
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Drivers</p>
              <p className="mt-2 text-2xl font-bold text-slate-800">{summary.totalDrivers || 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">{summary.availableDrivers || 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Drivers on Road</p>
              <p className="mt-2 text-2xl font-bold text-indigo-600">{summary.onTrip || 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Safety Score</p>
              <p className="mt-2 text-2xl font-bold text-slate-800">{summary.averageSafetyScore || 0}</p>
            </div>
          </div>
        );
      case "trips":
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Assignments</p>
              <p className="mt-2 text-2xl font-bold text-slate-800">{summary.totalTrips || 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Trips</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">{summary.completedTrips || 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">₹{(summary.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Distance Covered</p>
              <p className="mt-2 text-2xl font-bold text-slate-800">{(summary.totalDistance || 0).toLocaleString()} km</p>
            </div>
          </div>
        );
      case "fuel":
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fuel Liters Logged</p>
              <p className="mt-2 text-2xl font-bold text-slate-800">{(summary.totalLiters || 0).toLocaleString()} L</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fuel Expenditures</p>
              <p className="mt-2 text-2xl font-bold text-rose-500">₹{(summary.totalCost || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Fuel Efficiency</p>
              <p className="mt-2 text-2xl font-bold text-slate-800">{summary.averageEfficiency || 0} km/L</p>
            </div>
          </div>
        );
      case "maintenance":
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Records</p>
              <p className="mt-2 text-2xl font-bold text-slate-800">{summary.totalRecords || 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Shop Tasks</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">{summary.completedRecords || 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Repair Cost</p>
              <p className="mt-2 text-2xl font-bold text-rose-500">₹{(summary.totalCost || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Shop Logs</p>
              <p className="mt-2 text-2xl font-bold text-amber-600">{summary.activeRecords || 0}</p>
            </div>
          </div>
        );
      case "expenses":
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expenditures</p>
              <p className="mt-2 text-2xl font-bold text-rose-500">₹{(summary.totalExpenses || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fuel Cost Share</p>
              <p className="mt-2 text-2xl font-bold text-slate-800">₹{(summary.fuelExpenses || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Maintenance Cost Share</p>
              <p className="mt-2 text-2xl font-bold text-slate-800">₹{(summary.maintenanceExpenses || 0).toLocaleString()}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <motion.div
        className="space-y-6 pb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Title */}
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Reports & Analytics</h1>
          <p className="mt-2 text-slate-500">Generate, view, and export formatted transport operations reports.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-px">
          {reportCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleTabChange(category.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all duration-300 ${
                activeTab === category.id
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {category.icon}
              {category.label}
            </button>
          ))}
        </div>

        {/* Filters Panel */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Date Inputs */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-slate-400" />
              <input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              />
              <span className="text-slate-400 text-sm">to</span>
              <input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {(from || to || search) && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-orange-500 hover:text-orange-600 hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchReportData}
              className="rounded-xl border border-slate-200 bg-white p-3 text-slate-500 hover:bg-slate-50 hover:text-slate-700 shadow-sm transition"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Dynamic Summary Cards */}
        <AnimatePresence mode="wait">
          {!loading && summary && (
            <motion.div
              key={`${activeTab}-summary`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderSummaryCards()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Data Table and Export Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Export / Download Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4 gap-4">
            <div className="text-sm font-bold text-slate-800 capitalize">
              {activeTab} Report Data
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={exporting !== null}
                onClick={() => handleExport("pdf")}
                className="flex items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-100 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                {exporting === "pdf" ? "Exporting..." : "Download PDF"}
              </button>

              <button
                disabled={exporting !== null}
                onClick={() => handleExport("excel")}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition shadow-sm"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                {exporting === "excel" ? "Exporting..." : "Download Excel"}
              </button>

              <button
                disabled={exporting !== null}
                onClick={() => handleExport("csv")}
                className="flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-sm"
              >
                <FileText className="h-3.5 w-3.5" />
                {exporting === "csv" ? "Exporting..." : "Download CSV"}
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 uppercase text-xs border-b border-slate-100 bg-slate-50/20">
                  {renderHeaders()}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 px-6">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent mb-2"></div>
                      <p className="text-xs">Fetching report records...</p>
                    </td>
                  </tr>
                ) : reportData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">
                      <AlertCircle className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                      <p className="text-sm font-semibold">No report records found</p>
                      <p className="text-xs">Try adjusting your filters or search query.</p>
                    </td>
                  </tr>
                ) : (
                  reportData.map(renderRow)
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/20">
              <div className="text-xs text-slate-500 font-medium">
                Showing page <span className="font-semibold text-slate-800">{pagination.page}</span> of <span className="font-semibold text-slate-800">{pagination.totalPages}</span> ({pagination.total} records total)
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition shadow-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Reports;
