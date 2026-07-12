import './index.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './features/dashboard/pages/Dashboard'
import Home from './features/auth/pages/Home'
import Vehicles from './features/vehicles/pages/Vehicles'
import Trips from './features/trips/pages/Trips'
import { AuthProvider, useAuth } from './features/auth/context/AuthContext'
import Drivers from "./features/drivers/pages/Drivers";
import Reports from "./features/reports/pages/Reports";
import Settings from "./features/settings/pages/Settings";

function AppRoutes() {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return null
    }

    return (
        <Routes>
            <Route
                path="/"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />}
            />
            <Route
                path="/dashboard"
                element={isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />}
            />
            <Route 
                path="/drivers" 
                element={isAuthenticated ? <Drivers /> : <Navigate to="/" replace />} 
            />
            <Route 
                path="/reports" 
                element={isAuthenticated ? <Reports /> : <Navigate to="/" replace />} 
            />
            <Route 
                path="/settings" 
                element={isAuthenticated ? <Settings /> : <Navigate to="/" replace />} 
            />
            /* <Route
                path="/vehicles"
                element={isAuthenticated ? <Vehicles /> : <Navigate to="/" replace />}
            />
            <Route
                path="/trips"
                element={isAuthenticated ? <Trips /> : <Navigate to="/" replace />}
            />
            <Route
                path="/vehicles"
                element={isAuthenticated ? <Vehicles /> : <Navigate to="/" replace />}
            />
        </Routes>
    )
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
