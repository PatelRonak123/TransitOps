import './index.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './features/dashboard/pages/Dashboard'
import Home from './features/auth/pages/Home'
import { AuthProvider, useAuth } from './features/auth/context/AuthContext'

function AppRoutes() {
    const { isAuthenticated, isLoading } = useAuth()

    return (
        <Routes>
            <Route
                path="/"
                element={isLoading ? null : (isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />)}
            />
            <Route
                path="/dashboard"
                element={isLoading ? null : (isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />)}
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
