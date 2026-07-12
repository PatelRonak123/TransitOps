import { useCallback, useRef, useState } from "react";
import { showHttpToast } from "../../../lib/httpToast";
import vehicleService from "../service/vehicleService";

const defaultPagination = { page: 1, limit: 10, total: 0, totalPages: 1 };
const defaultStats = {
  totalVehicles: 0,
  availableVehicles: 0,
  onTripVehicles: 0,
  maintenanceVehicles: 0,
  retiredVehicles: 0,
};

export default function useVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const lastParamsRef = useRef({ page: 1, limit: 10 });

  const fetchVehicles = useCallback(async (params = {}) => {
    const nextParams = { page: 1, limit: 10, ...params };
    lastParamsRef.current = nextParams;
    setLoading(true);
    setError("");

    try {
      const response = await vehicleService.list(nextParams);
      setVehicles(response?.data || []);
      setPagination(response?.pagination || defaultPagination);
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to load vehicles";
      setError(message);
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await vehicleService.statistics();
      setStats({ ...defaultStats, ...response });
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to load vehicle statistics";
      setError(message);
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    }
  }, []);

  const refreshCurrentView = useCallback(async () => {
    await Promise.all([fetchVehicles(lastParamsRef.current), fetchStats()]);
  }, [fetchStats, fetchVehicles]);

  const createVehicle = useCallback(async (payload) => {
    try {
      const response = await vehicleService.create(payload);
      await refreshCurrentView();
      showHttpToast(200, response?.message || "Vehicle created successfully");
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to create vehicle";
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    }
  }, [refreshCurrentView]);

  const updateVehicle = useCallback(async (id, payload) => {
    try {
      const response = await vehicleService.update(id, payload);
      await refreshCurrentView();
      showHttpToast(200, response?.message || "Vehicle updated successfully");
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to update vehicle";
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    }
  }, [refreshCurrentView]);

  const removeVehicle = useCallback(async (id) => {
    try {
      const response = await vehicleService.remove(id);
      await refreshCurrentView();
      showHttpToast(200, response?.message || "Vehicle deleted successfully");
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to delete vehicle";
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    }
  }, [refreshCurrentView]);

  return {
    vehicles,
    pagination,
    stats,
    loading,
    error,
    fetchVehicles,
    fetchStats,
    createVehicle,
    updateVehicle,
    removeVehicle,
  };
}
