import apiClient from "../../../service/api";

const reportService = {
  getReport: async (type, params = {}) => {
    const response = await apiClient.get(`/api/reports/${type}`, { params });
    return response.data;
  },

  exportReport: async (type, format, params = {}) => {
    const response = await apiClient.get(`/api/export/${type}/${format}`, {
      params,
      responseType: "blob"
    });
    return response.data;
  }
};

export default reportService;
