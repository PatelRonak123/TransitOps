import apiClient from "../../../service/api";

const authService = {
    login: async (credentials) => {
        const response = await apiClient.post("/api/auth/login", credentials);
        return response.data;
    },

    me: async () => {
        const response = await apiClient.get("/api/auth/me");
        return response.data;
    },

    logout: async () => {
        const response = await apiClient.post("/api/auth/logout");
        return response.data;
    },
};

export default authService;