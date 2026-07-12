import { useCallback, useEffect, useState } from "react";
import driverService from "../service/driverService";
import { showHttpToast } from "../../../lib/httpToast";

export default function useDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDrivers = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");

    try {
      const response = await driverService.list(params);
      setDrivers(response?.data || []);
      setPagination(response?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to load drivers";
      setError(message);
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await driverService.statistics();
      setStats(response);
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to load driver statistics";
      setError(message);
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    }
  }, []);

  const createDriver = useCallback(async (payload) => {
    try {
      const response = await driverService.create(payload);
      await fetchDrivers({ page: 1, limit: pagination.limit });
      await fetchStats();
      showHttpToast(200, response?.message || "Driver created successfully");
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to create driver";
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    }
  }, [fetchDrivers, fetchStats, pagination.limit]);

  const removeDriver = useCallback(async (id) => {
    try {
      const response = await driverService.remove(id);
      await fetchDrivers({ page: 1, limit: pagination.limit });
      await fetchStats();
      showHttpToast(200, response?.message || "Driver deleted successfully");
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to delete driver";
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    }
  }, [fetchDrivers, fetchStats, pagination.limit]);

  useEffect(() => {
    fetchDrivers({ page: 1, limit: 10 });
    fetchStats();
  }, [fetchDrivers, fetchStats]);

  return {
    drivers,
    pagination,
    stats,
    loading,
    error,
    fetchDrivers,
    fetchStats,
    createDriver,
    removeDriver,
  };
}
