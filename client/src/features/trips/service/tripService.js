import apiClient from "../../../service/api";

const tripService = {
  list: async (params = {}) => {
    const response = await apiClient.get("/api/trips", { params });
    return response.data;
  },

  statistics: async () => {
    const response = await apiClient.get("/api/trips/statistics");
    return response.data;
  },

  create: async (payload) => {
    const response = await apiClient.post("/api/trips", payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await apiClient.patch(`/api/trips/${id}`, payload);
    return response.data;
  },

  remove: async (id) => {
    const response = await apiClient.delete(`/api/trips/${id}`);
    return response.data;
  },

  dispatch: async (id) => {
    const response = await apiClient.post(`/api/trips/${id}/dispatch`);
    return response.data;
  },

  complete: async (id, payload) => {
    const response = await apiClient.post(`/api/trips/${id}/complete`, payload);
    return response.data;
  },

  cancel: async (id) => {
    const response = await apiClient.post(`/api/trips/${id}/cancel`);
    return response.data;
  },

  availableVehicles: async () => {
    const response = await apiClient.get("/api/vehicles/available");
    return response.data;
  },

  availableDrivers: async () => {
    const response = await apiClient.get("/api/drivers/available");
    return response.data;
  },
};

export default tripService;
