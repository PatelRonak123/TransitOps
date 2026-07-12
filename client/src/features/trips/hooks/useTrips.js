import { useCallback, useRef, useState } from "react";
import { showHttpToast } from "../../../lib/httpToast";
import tripService from "../service/tripService";

const defaultPagination = { page: 1, limit: 10, total: 0, totalPages: 1 };
const defaultStats = {
  totalTrips: 0,
  draftTrips: 0,
  activeTrips: 0,
  completedTrips: 0,
  cancelledTrips: 0,
};

export default function useTrips() {
  const [trips, setTrips] = useState([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [stats, setStats] = useState(defaultStats);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [error, setError] = useState("");
  const lastParamsRef = useRef({ page: 1, limit: 10 });

  const fetchTrips = useCallback(async (params = {}) => {
    const nextParams = { page: 1, limit: 10, ...params };
    lastParamsRef.current = nextParams;
    setLoading(true);
    setError("");

    try {
      const response = await tripService.list(nextParams);
      setTrips(response?.data || []);
      setPagination(response?.pagination || defaultPagination);
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to load trips";
      setError(message);
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await tripService.statistics();
      setStats({ ...defaultStats, ...response });
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to load trip statistics";
      setError(message);
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    }
  }, []);

  const fetchReferenceData = useCallback(async () => {
    setReferenceLoading(true);

    try {
      const [vehicleResponse, driverResponse] = await Promise.all([
        tripService.availableVehicles(),
        tripService.availableDrivers(),
      ]);

      setVehicles(vehicleResponse?.data || []);
      setDrivers(driverResponse?.data || []);
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to load vehicles and drivers";
      setError(message);
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    } finally {
      setReferenceLoading(false);
    }
  }, []);

  const refreshCurrentView = useCallback(async () => {
    await Promise.all([fetchTrips(lastParamsRef.current), fetchStats(), fetchReferenceData()]);
  }, [fetchReferenceData, fetchStats, fetchTrips]);

  const createTrip = useCallback(async (payload) => {
    try {
      const response = await tripService.create(payload);
      await refreshCurrentView();
      showHttpToast(200, response?.message || "Trip created successfully");
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to create trip";
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    }
  }, [refreshCurrentView]);

  const updateTrip = useCallback(async (id, payload) => {
    try {
      const response = await tripService.update(id, payload);
      await refreshCurrentView();
      showHttpToast(200, response?.message || "Trip updated successfully");
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to update trip";
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    }
  }, [refreshCurrentView]);

  const removeTrip = useCallback(async (id) => {
    try {
      const response = await tripService.remove(id);
      await refreshCurrentView();
      showHttpToast(200, response?.message || "Trip deleted successfully");
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to delete trip";
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    }
  }, [refreshCurrentView]);

  const dispatchTrip = useCallback(async (id) => {
    try {
      const response = await tripService.dispatch(id);
      await refreshCurrentView();
      showHttpToast(200, response?.message || "Trip dispatched successfully");
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to dispatch trip";
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    }
  }, [refreshCurrentView]);

  const completeTrip = useCallback(async (id, payload) => {
    try {
      const response = await tripService.complete(id, payload);
      await refreshCurrentView();
      showHttpToast(200, response?.message || "Trip completed successfully");
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to complete trip";
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    }
  }, [refreshCurrentView]);

  const cancelTrip = useCallback(async (id) => {
    try {
      const response = await tripService.cancel(id);
      await refreshCurrentView();
      showHttpToast(200, response?.message || "Trip cancelled successfully");
      return response;
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to cancel trip";
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    }
  }, [refreshCurrentView]);

  return {
    trips,
    pagination,
    stats,
    vehicles,
    drivers,
    loading,
    referenceLoading,
    error,
    fetchTrips,
    fetchStats,
    fetchReferenceData,
    createTrip,
    updateTrip,
    removeTrip,
    dispatchTrip,
    completeTrip,
    cancelTrip,
  };
}
