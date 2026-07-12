import "./index.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./features/dashboard/pages/Dashboard";
import Home from "./features/auth/pages/Home";
import Vehicles from "./features/vehicles/pages/Vehicles";
import Trips from "./features/trips/pages/Trips";
import { AuthProvider, useAuth } from "./features/auth/context/AuthContext";
import Drivers from "./features/drivers/pages/Drivers";
import Reports from "./features/reports/pages/Reports";
import Settings from "./features/settings/pages/Settings";
import FuelExpenses from "./features/fuel-expenses/pages/FuelExpenses";
import Maintenance from "./features/maintenance/pages/Maintenance";
import AiDiagnostics from "./features/ai/pages/AiDiagnostics";

const getDefaultPath = (role) => {
  switch (role) {
    case "Fleet Manager":
      return "/vehicles";
    case "Safety Officer":
      return "/drivers";
    case "Financial Analyst":
      return "/fuel-expenses";
    case "Dispatcher":
    default:
      return "/dashboard";
  }
};

const routeRoles = {
  "/dashboard": ["Dispatcher"],
  "/vehicles": ["Fleet Manager"],
  "/maintenance": ["Fleet Manager"],
  "/ai-diagnostics": ["Fleet Manager"],
  "/drivers": ["Safety Officer"],
  "/trips": ["Dispatcher"],
  "/fuel-expenses": ["Financial Analyst"],
  "/reports": ["Financial Analyst"],
  "/settings": [
    "Fleet Manager",
    "Dispatcher",
    "Safety Officer",
    "Financial Analyst",
  ],
};

function ProtectedRoute({ element, path }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const allowed = routeRoles[path];
  if (allowed && !allowed.includes(user?.role)) {
    return <Navigate to={getDefaultPath(user?.role)} replace />;
  }

  return element;
}

function AppRoutes() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultPath(user?.role)} replace />
          ) : (
            <Home />
          )
        }
      />
      <Route
        path="/dashboard"
        element={<ProtectedRoute path="/dashboard" element={<Dashboard />} />}
      />
      <Route
        path="/drivers"
        element={<ProtectedRoute path="/drivers" element={<Drivers />} />}
      />
      <Route
        path="/reports"
        element={<ProtectedRoute path="/reports" element={<Reports />} />}
      />
      <Route
        path="/settings"
        element={<ProtectedRoute path="/settings" element={<Settings />} />}
      />
      <Route
        path="/vehicles"
        element={<ProtectedRoute path="/vehicles" element={<Vehicles />} />}
      />
      <Route
        path="/trips"
        element={<ProtectedRoute path="/trips" element={<Trips />} />}
      />
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute path="/maintenance" element={<Maintenance />} />
        }
      />
      <Route
        path="/ai-diagnostics"
        element={
          <ProtectedRoute path="/ai-diagnostics" element={<AiDiagnostics />} />
        }
      />
      <Route
        path="/fuel-expenses"
        element={
          <ProtectedRoute path="/fuel-expenses" element={<FuelExpenses />} />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
