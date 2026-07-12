import apiClient from "../../../service/api";

const driverService = {
  list: async (params = {}) => {
    const response = await apiClient.get("/api/drivers", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/drivers/${id}`);
    return response.data;
  },

  create: async (payload) => {
    const response = await apiClient.post("/api/drivers", payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await apiClient.patch(`/api/drivers/${id}`, payload);
    return response.data;
  },

  remove: async (id) => {
    const response = await apiClient.delete(`/api/drivers/${id}`);
    return response.data;
  },

  available: async () => {
    const response = await apiClient.get("/api/drivers/available");
    return response.data;
  },

  upcomingExpiry: async (days = 30) => {
    const response = await apiClient.get("/api/drivers/license-expiry", { params: { days } });
    return response.data;
  },

  statistics: async () => {
    const response = await apiClient.get("/api/drivers/statistics");
    return response.data;
  },
};

export default driverService;
