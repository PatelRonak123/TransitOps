import apiClient from "../../../service/api";

const maintenanceService = {
  list: async (params = {}) => {
    const response = await apiClient.get("/api/maintenance", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/maintenance/${id}`);
    return response.data;
  },

  create: async (payload) => {
    const response = await apiClient.post("/api/maintenance", payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await apiClient.patch(`/api/maintenance/${id}`, payload);
    return response.data;
  },

  remove: async (id) => {
    const response = await apiClient.delete(`/api/maintenance/${id}`);
    return response.data;
  },

  start: async (id) => {
    const response = await apiClient.post(`/api/maintenance/${id}/start`);
    return response.data;
  },

  complete: async (id, payload) => {
    const response = await apiClient.post(`/api/maintenance/${id}/complete`, payload);
    return response.data;
  },

  cancel: async (id) => {
    const response = await apiClient.post(`/api/maintenance/${id}/cancel`);
    return response.data;
  },

  statistics: async () => {
    const response = await apiClient.get("/api/maintenance/statistics");
    return response.data;
  },
};

export default maintenanceService;
