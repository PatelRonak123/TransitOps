import { useCallback, useEffect, useState } from "react";
import fuelExpenseService from "../service/fuelExpenseService";
import { showHttpToast } from "../../../lib/httpToast";

export default function useFuelExpenses() {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [fuelStats, setFuelStats] = useState(null);
  const [expenseStats, setExpenseStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");

    try {
      const [fuelResponse, expenseResponse, fuelStatsResponse, expenseStatsResponse] = await Promise.all([
        fuelExpenseService.getFuelLogs(params),
        fuelExpenseService.getExpenses(params),
        fuelExpenseService.getFuelStats(),
        fuelExpenseService.getExpenseStats(),
      ]);

      setFuelLogs(fuelResponse?.data || []);
      setExpenses(expenseResponse?.data || []);
      setFuelStats(fuelStatsResponse || null);
      setExpenseStats(expenseStatsResponse || null);
      return { fuelResponse, expenseResponse, fuelStatsResponse, expenseStatsResponse };
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to load fuel and expense data";
      setError(message);
      showHttpToast(err?.response?.status || 500, message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createFuel = useCallback(async (payload) => {
    const response = await fuelExpenseService.createFuelLog(payload);
    await fetchData();
    showHttpToast(200, response?.message || "Fuel log created");
    return response;
  }, [fetchData]);

  const createExpenseEntry = useCallback(async (payload) => {
    const response = await fuelExpenseService.createExpense(payload);
    await fetchData();
    showHttpToast(200, response?.message || "Expense created");
    return response;
  }, [fetchData]);

  const deleteFuel = useCallback(async (id) => {
    const response = await fuelExpenseService.deleteFuelLog(id);
    await fetchData();
    showHttpToast(200, response?.message || "Fuel log deleted");
    return response;
  }, [fetchData]);

  const deleteExpense = useCallback(async (id) => {
    const response = await fuelExpenseService.deleteExpense(id);
    await fetchData();
    showHttpToast(200, response?.message || "Expense deleted");
    return response;
  }, [fetchData]);

  useEffect(() => {
    fetchData({ page: 1, limit: 10 });
  }, [fetchData]);

  return {
    fuelLogs,
    expenses,
    fuelStats,
    expenseStats,
    loading,
    error,
    fetchData,
    createFuel,
    createExpenseEntry,
    deleteFuel,
    deleteExpense,
  };
}
