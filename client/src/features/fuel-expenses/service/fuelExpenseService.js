import apiClient from "../../../service/api";

const fuelExpenseService = {
  getFuelLogs: async (params = {}) => {
    const response = await apiClient.get("/api/fuel", { params });
    return response.data;
  },

  getExpenses: async (params = {}) => {
    const response = await apiClient.get("/api/expenses", { params });
    return response.data;
  },

  getFuelStats: async () => {
    const response = await apiClient.get("/api/fuel/statistics");
    return response.data;
  },

  getExpenseStats: async () => {
    const response = await apiClient.get("/api/expenses/statistics");
    return response.data;
  },

  createFuelLog: async (payload) => {
    const response = await apiClient.post("/api/fuel", payload);
    return response.data;
  },

  createExpense: async (payload) => {
    const response = await apiClient.post("/api/expenses", payload);
    return response.data;
  },

  deleteFuelLog: async (id) => {
    const response = await apiClient.delete(`/api/fuel/${id}`);
    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await apiClient.delete(`/api/expenses/${id}`);
    return response.data;
  },
};

export default fuelExpenseService;
