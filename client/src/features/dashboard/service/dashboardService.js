import apiClient from "../../../service/api";

const dashboardService = {
  getSummary: async (params = {}) => {
    const response = await apiClient.get("/api/dashboard", { params });
    return response.data;
  },

  getFleetKPIs: async (params = {}) => {
    const response = await apiClient.get("/api/dashboard/fleet", { params });
    return response.data;
  },

  getTripKPIs: async (params = {}) => {
    const response = await apiClient.get("/api/dashboard/trips", { params });
    return response.data;
  },

  getFinancialKPIs: async (params = {}) => {
    const response = await apiClient.get("/api/dashboard/financial", { params });
    return response.data;
  },

  getChartData: async (params = {}) => {
    const response = await apiClient.get("/api/dashboard/charts", { params });
    return response.data;
  },

  getTopVehicles: async (params = {}) => {
    const response = await apiClient.get("/api/dashboard/top-vehicles", { params });
    return response.data;
  },

  getAlerts: async () => {
    const response = await apiClient.get("/api/dashboard/alerts");
    return response.data;
  },

  getRecentTrips: async (limit = 5) => {
    const response = await apiClient.get("/api/trips", { params: { limit, page: 1 } });
    return response.data;
  },

  searchSystem: async (query) => {
    const response = await apiClient.get("/api/dashboard/search", { params: { q: query } });
    return response.data;
  }
};

export default dashboardService;
