import { createContext, useContext, useEffect, useMemo, useState } from "react";
import authService from "../service/authService";
import { clearSession } from "../utils/session";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const hydrateSession = async () => {
            try {
                const response = await authService.me();

                if (active) {
                    setUser(response?.user ?? null);
                }
            } catch {
                if (active) {
                    setUser(null);
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        hydrateSession();

        return () => {
            active = false;
        };
    }, []);

    const login = (nextUser) => {
        setUser(nextUser);
    };

    const logout = () => {
        clearSession();
        setUser(null);
    };

    const value = useMemo(() => ({
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
    }), [user, isLoading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}