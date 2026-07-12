import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Truck,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Calendar,
  Layers,
  Wrench,
  Gauge,
  Info,
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  Loader2
} from "lucide-react";
import MainLayout from "../../../components/layout/MainLayout";
import apiClient from "../../../service/api";
import { showHttpToast } from "../../../lib/httpToast";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const scanTexts = [
  "Fetching vehicle real-time telemetry...",
  "Calibrating odometer and logs index...",
  "Analyzing previous repair logs...",
  "Running scikit-learn classification...",
  "Generating predictive diagnostics..."
];

const AiDiagnostics = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanIndex, setScanIndex] = useState(0);
  const [diagnostics, setDiagnostics] = useState(null);
  const [scheduling, setScheduling] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(false);

  // Fetch all vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await apiClient.get("/api/vehicles", { params: { limit: 100 } });
        if (response.data?.success) {
          setVehicles(response.data.data || []);
          if (response.data.data?.length > 0) {
            setSelectedVehicle(response.data.data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load vehicles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // Cycle scanner texts during analysis
  useEffect(() => {
    let interval;
    if (scanning) {
      interval = setInterval(() => {
        setScanIndex((prev) => (prev < scanTexts.length - 1 ? prev + 1 : prev));
      }, 350);
    } else {
      setScanIndex(0);
    }
    return () => clearInterval(interval);
  }, [scanning]);

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDiagnostics(null);
    setTicketCreated(false);
  };

  const runDiagnosis = async () => {
    if (!selectedVehicle) return;
    setScanning(true);
    setDiagnostics(null);
    setTicketCreated(false);

    try {
      const response = await apiClient.get(`/api/vehicles/${selectedVehicle.id}/diagnose`);
      // Hold scanner for at least 1.5 seconds for visualization
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setDiagnostics(response.data);
      if (response.data?.error) {
        showHttpToast(200, "AI microservice offline. Displaying heuristic estimate.");
      } else {
        showHttpToast(200, "AI Predictive Diagnosis Completed Successfully.");
      }
    } catch (err) {
      console.error("AI diagnostics failed:", err);
      showHttpToast(500, "Failed to run AI diagnostics.");
    } finally {
      setScanning(false);
    }
  };

  const scheduleMaintenance = async () => {
    if (!selectedVehicle || !diagnostics) return;
    setScheduling(true);
    try {
      const payload = {
        vehicle_id: selectedVehicle.id,
        maintenance_type: "General Service",
        issue_title: `[AI Alert] Predictive Maintenance Scheduled (${diagnostics.prediction?.maintenance_risk} Risk)`,
        priority: diagnostics.prediction?.maintenance_risk === "High" ? "High" : "Medium",
        estimated_cost: (selectedVehicle.odometer ? Math.round(Number(selectedVehicle.odometer) * 0.02) : 150).toString(),
        start_date: new Date().toISOString().split("T")[0],
        expected_completion_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] // 2 days later
      };

      const response = await apiClient.post("/api/maintenance", payload);
      if (response.data?.success) {
        setTicketCreated(true);
        showHttpToast(200, "Maintenance ticket created successfully.");
      }
    } catch (err) {
      console.error("Failed to auto-schedule maintenance:", err);
      showHttpToast(500, err.response?.data?.message || "Failed to schedule maintenance.");
    } finally {
      setScheduling(false);
    }
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.registration_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vehicle_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <motion.div
        className="h-full flex flex-col gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <Brain className="h-9 w-9 text-orange-500" />
              AI Diagnostics
            </h1>
            <p className="mt-2 text-slate-500">
              Machine Learning Predictive Maintenance system powered by scikit-learn analytics.
            </p>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          {/* Vehicles List Sidebar */}
          <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white flex flex-col p-4 shadow-sm overflow-hidden h-[calc(100vh-210px)] min-h-[400px]">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
              {loading ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Loading fleet data...
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No matching vehicles.
                </div>
              ) : (
                filteredVehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleSelectVehicle(v)}
                    disabled={scanning}
                    className={`w-full text-left p-3.5 rounded-xl transition flex items-center gap-3 mb-1 ${
                      selectedVehicle?.id === v.id
                        ? "bg-orange-50 text-orange-600 font-bold border border-orange-200/50"
                        : "hover:bg-slate-50 text-slate-700 font-semibold"
                    }`}
                  >
                    <Truck className="h-5 w-5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm leading-tight truncate">{v.registration_number}</p>
                      <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{v.vehicle_name}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Main Diagnostic Panel */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white flex flex-col p-6 shadow-sm overflow-y-auto h-[calc(100vh-210px)] min-h-[400px]">
            {selectedVehicle ? (
              <div className="space-y-6 text-left">
                {/* Active Selection Info */}
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="rounded-xl bg-orange-500 p-3 text-white">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{selectedVehicle.vehicle_name}</h3>
                    <p className="text-slate-500 text-xs font-semibold uppercase mt-0.5">
                      Plate: {selectedVehicle.registration_number} &nbsp;•&nbsp; Type: {selectedVehicle.vehicle_type}
                    </p>
                  </div>
                </div>

                {/* Telemetry Input Panel */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-700 text-sm tracking-wide uppercase flex items-center gap-1.5">
                    <Layers className="h-4.5 w-4.5 text-slate-400" />
                    Telemetry & Feature Inputs
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Odometer</span>
                      <p className="text-lg font-extrabold text-slate-800 mt-1">{(selectedVehicle.odometer || 0).toLocaleString()} km</p>
                    </div>
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Acquisition Cost</span>
                      <p className="text-lg font-extrabold text-slate-800 mt-1">${(selectedVehicle.acquisition_cost || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Current Status</span>
                      <p className="text-lg font-extrabold text-slate-800 mt-1">{selectedVehicle.status}</p>
                    </div>
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Vehicle Model</span>
                      <p className="text-lg font-extrabold text-slate-800 mt-1 truncate">{selectedVehicle.vehicle_model || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Scan Action */}
                {!diagnostics && !scanning && (
                  <div className="py-6 text-center">
                    <button
                      onClick={runDiagnosis}
                      className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 font-bold shadow-md shadow-orange-500/10 hover:shadow-lg transition cursor-pointer"
                    >
                      <Sparkles className="h-5 w-5" />
                      Run AI Diagnostic Scan
                    </button>
                  </div>
                )}

                {/* Scanner Radar Animation */}
                {scanning && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-6">
                    {/* Pulsing Scan Circles */}
                    <div className="relative h-28 w-28 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-orange-500/20 bg-orange-500/5 animate-ping"></div>
                      <div className="absolute inset-4 rounded-full border border-orange-500/30 bg-orange-500/10 animate-pulse"></div>
                      <div className="h-16 w-16 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                        <Activity className="h-8 w-8 animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-bold text-slate-800 animate-pulse">{scanTexts[scanIndex]}</p>
                      <p className="text-xs text-slate-400">Communicating with scikit-learn backend predictor...</p>
                    </div>
                  </div>
                )}

                {/* Scan Outcomes */}
                <AnimatePresence>
                  {diagnostics && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="space-y-6"
                    >
                      <div className="border-t border-slate-100 pt-6">
                        <h4 className="font-bold text-slate-700 text-sm tracking-wide uppercase flex items-center gap-1.5 mb-4">
                          <Gauge className="h-4.5 w-4.5 text-slate-400" />
                          Diagnostic Results
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Risk Card */}
                          <div className={`col-span-1 rounded-2xl border p-5 flex flex-col justify-between ${
                            diagnostics.prediction?.maintenance_risk === "High" ? "bg-rose-50/50 border-rose-200 text-rose-800" :
                            diagnostics.prediction?.maintenance_risk === "Medium" ? "bg-amber-50/50 border-amber-200 text-amber-800" :
                            "bg-emerald-50/50 border-emerald-200 text-emerald-800"
                          }`}>
                            <div>
                              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Maintenance Risk Level</p>
                              <div className="flex items-center gap-2 mt-3">
                                {diagnostics.prediction?.maintenance_risk === "High" ? <AlertTriangle className="h-7 w-7 text-rose-500" /> :
                                 diagnostics.prediction?.maintenance_risk === "Medium" ? <Clock className="h-7 w-7 text-amber-500" /> :
                                 <CheckCircle className="h-7 w-7 text-emerald-500" />}
                                <span className="text-3xl font-black">{diagnostics.prediction?.maintenance_risk}</span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-4 leading-relaxed font-semibold">
                              {diagnostics.prediction?.maintenance_risk === "High"
                                ? "Critical telematics indicators flagged. Service allocation recommended."
                                : diagnostics.prediction?.maintenance_risk === "Medium"
                                ? "Telemetry indicators within intermediate ranges. Schedule routine check."
                                : "All systems functioning normal. No maintenance anomalies detected."}
                            </p>
                          </div>

                          {/* Confidence Card */}
                          <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
                            <div>
                              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Model Confidence</p>
                              <div className="flex items-center gap-3 mt-3">
                                <ShieldCheck className="h-7 w-7 text-orange-500" />
                                <span className="text-3xl font-black text-slate-800">{diagnostics.prediction?.confidence}%</span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-4 leading-relaxed font-semibold">
                              Probability score generated by Scikit-Learn classifier matching parameters.
                            </p>
                          </div>

                          {/* Countdown Schedule */}
                          <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
                            <div>
                              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Service Allocation</p>
                              <div className="flex items-center gap-3 mt-3">
                                <Calendar className="h-7 w-7 text-blue-500" />
                                <span className="text-3xl font-black text-slate-800">{diagnostics.prediction?.service_in_days} Days</span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-4 leading-relaxed font-semibold">
                              Recommended maximum timeframe before checking mechanics.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Computed Inputs Inspector Panel */}
                      <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/20">
                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                          <Activity className="h-4 w-4 text-slate-400" />
                          Feature Vector fed to Model
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-slate-400 font-medium">Mapped Type</span>
                            <p className="font-bold text-slate-800 mt-0.5">{diagnostics.features?.vehicle_type}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">Estimated Age</span>
                            <p className="font-bold text-slate-800 mt-0.5">{diagnostics.features?.vehicle_age_years} Years</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">Days Since Service</span>
                            <p className="font-bold text-slate-800 mt-0.5">{diagnostics.features?.days_since_last_service} Days</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">Previous Repairs</span>
                            <p className="font-bold text-slate-800 mt-0.5">{diagnostics.features?.previous_repairs} Logs</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">Avg Daily Distance</span>
                            <p className="font-bold text-slate-800 mt-0.5">{diagnostics.features?.avg_daily_distance_km} km</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">Fuel Efficiency</span>
                            <p className="font-bold text-slate-800 mt-0.5">{diagnostics.features?.fuel_efficiency_kmpl} km/L</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">Maint. Cost (Year)</span>
                            <p className="font-bold text-slate-800 mt-0.5">${diagnostics.features?.maintenance_cost_last_year?.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">AI Service Mode</span>
                            <p className="font-bold text-emerald-600 mt-0.5">{diagnostics.error ? "Offline Heuristic" : "FastAPI Classifier"}</p>
                          </div>
                        </div>

                        {diagnostics.error && (
                          <div className="mt-4 flex gap-2 text-[10px] text-amber-700 bg-amber-50 border border-amber-100 p-2.5 rounded-xl font-medium">
                            <Info className="h-4 w-4 text-amber-500 flex-shrink-0" />
                            <span>{diagnostics.error}</span>
                          </div>
                        )}
                      </div>

                      {/* Diagnostic Action Bar */}
                      <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-6 gap-4">
                        <div className="text-xs text-slate-400 font-medium">
                          Schedule recommendations automatically feed tickets into the Maintenance pipeline.
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={runDiagnosis}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                          >
                            Re-Scan Vehicle
                          </button>

                          {ticketCreated ? (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl">
                              <CheckCircle className="h-4 w-4" />
                              Maintenance Scheduled!
                            </div>
                          ) : (
                            <button
                              onClick={scheduleMaintenance}
                              disabled={scheduling}
                              className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 text-sm font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                            >
                              {scheduling ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Wrench className="h-4 w-4" />}
                              Schedule AI Maintenance Ticket
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-400 py-16">
                <Brain className="h-14 w-14 text-slate-200 mb-3" />
                <h3 className="text-lg font-bold text-slate-700">Fleet AI Diagnostics Center</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                  Select a vehicle from the fleet roster sidebar, verify telemetry features, and execute the AI diagnosis scanner.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default AiDiagnostics;
