import { useState } from "react";
import authService from "../service/authService";
import { showHttpToast } from "../../../lib/httpToast";
import { useAuth } from "../context/AuthContext";

export default function useLogin() {

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { login: setAuthenticatedUser } = useAuth();

    async function login(data) {

        setIsLoading(true);
        setError("");

        try {

            const response = await authService.login({
                email: data.email.trim(),
                password: data.password,
                role: data.role,
                rememberMe: Boolean(data.rememberMe),
            });

            if (response?.user) {
                setAuthenticatedUser(response.user);
            }

            showHttpToast(200, "Login successful.");

            return response;

        }

        catch (err) {

            const statusCode = err?.response?.status || 500;
            const message = err?.response?.data?.message || "Unable to sign in. Check your credentials and try again.";
            setError(message);
            showHttpToast(statusCode, message);
            throw err;

        }

        finally {

            setIsLoading(false);

        }

    }

    return { login, isLoading, error };
}
