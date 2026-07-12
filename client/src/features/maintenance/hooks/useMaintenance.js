import { useCallback, useEffect, useState } from "react";
import maintenanceService from "../service/maintenanceService";
import { showHttpToast } from "../../../lib/httpToast";

export default function useMaintenance() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");

    try {
      const [listResponse, statsResponse] = await Promise.all([
        maintenanceService.list(params),
        maintenanceService.statistics(),
      ]);

      setRecords(listResponse?.data || []);
      setStats(statsResponse || null);
      return { listResponse, statsResponse };
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to load maintenance records";
      setError(message);
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createRecord = useCallback(async (payload) => {
    try {
      const response = await maintenanceService.create(payload);
      await fetchData();
      showHttpToast(200, response?.message || "Maintenance record created");
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to create maintenance record";
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    }
  }, [fetchData]);

  const startRecord = useCallback(async (id) => {
    try {
      const response = await maintenanceService.start(id);
      await fetchData();
      showHttpToast(200, response?.message || "Maintenance started");
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to start maintenance";
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    }
  }, [fetchData]);

  const completeRecord = useCallback(async (id, payload) => {
    try {
      const response = await maintenanceService.complete(id, payload);
      await fetchData();
      showHttpToast(200, response?.message || "Maintenance completed");
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to complete maintenance";
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    }
  }, [fetchData]);

  const cancelRecord = useCallback(async (id) => {
    try {
      const response = await maintenanceService.cancel(id);
      await fetchData();
      showHttpToast(200, response?.message || "Maintenance cancelled");
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to cancel maintenance";
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    }
  }, [fetchData]);

  useEffect(() => {
    fetchData({ page: 1, limit: 10 });
  }, [fetchData]);

  return {
    records,
    stats,
    loading,
    error,
    fetchData,
    createRecord,
    startRecord,
    completeRecord,
    cancelRecord,
  };
}
