import apiClient from "../../../service/api";

const vehicleService = {
  list: async (params = {}) => {
    const response = await apiClient.get("/api/vehicles", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/vehicles/${id}`);
    return response.data;
  },

  create: async (payload) => {
    const response = await apiClient.post("/api/vehicles", payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await apiClient.patch(`/api/vehicles/${id}`, payload);
    return response.data;
  },

  remove: async (id) => {
    const response = await apiClient.delete(`/api/vehicles/${id}`);
    return response.data;
  },

  available: async () => {
    const response = await apiClient.get("/api/vehicles/available");
    return response.data;
  },

  statistics: async () => {
    const response = await apiClient.get("/api/vehicles/statistics");
    return response.data;
  },
};

export default vehicleService;
