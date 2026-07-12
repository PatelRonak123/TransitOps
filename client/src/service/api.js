import axios from "axios"
import { showHttpToast } from "../lib/httpToast"

const apiClient = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
})

// request interceptor
apiClient.interceptors.request.use(
    (config) => {
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// response interceptor
apiClient.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response && error.response.status === 403) {
            const message = error.response.data?.message || "Access forbidden. Insufficient permissions.";
            showHttpToast(403, message);
        }
        return Promise.reject(error)
    }
)

export default apiClient