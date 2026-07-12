import './index.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './features/dashboard/pages/Dashboard'
import Home from './features/auth/pages/Home'
import Vehicles from './features/vehicles/pages/Vehicles'
import Trips from './features/trips/pages/Trips'
// import Maintenance from './features/maintenance/pages/Maintenance'
import { AuthProvider, useAuth } from './features/auth/context/AuthContext'
import Drivers from "./features/drivers/pages/Drivers";

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
                path="/trips"
                element={isAuthenticated ? <Trips /> : <Navigate to="/" replace />}
            />
            <Route
                path="/vehicles"
                element={isAuthenticated ? <Vehicles /> : <Navigate to="/" replace />}
            />
            {/* <Route
                path="/maintenance"
                element={isAuthenticated ? <Maintenance /> : <Navigate to="/" replace />}
            /> */}
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
