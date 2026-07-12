import {
  FaTachometerAlt,
  FaTruck,
  FaUserTie,
  FaRoute,
  FaTools,
  FaGasPump,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import authService from "../../features/auth/service/authService";
import { showHttpToast } from "../../lib/httpToast";
import { useAuth } from "../../features/auth/context/AuthContext";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <FaTachometerAlt />,
  },
  {
    name: "Vehicles",
    path: "/vehicles",
    icon: <FaTruck />,
  },
  {
    name: "Drivers",
    path: "/drivers",
    icon: <FaUserTie />,
  },
  {
    name: "Trips",
    path: "/trips",
    icon: <FaRoute />,
  },
  {
    name: "Maintenance",
    path: "/maintenance",
    icon: <FaTools />,
  },
  {
    name: "Fuel & Expenses",
    path: "/fuel-expenses",
    icon: <FaGasPump />,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: <FaChartBar />,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: <FaCog />,
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      const response = await authService.logout();
      showHttpToast(200, response?.message || "Logged out successfully.");
    } finally {
      logout();
      navigate("/", { replace: true });
    }
  };

  return (
    <aside className="w-64 h-screen bg-slate-900 text-white flex flex-col shadow-lg">

      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-cyan-400">
          TransitOps
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Smart Transport Platform
        </p>
      </div>

      {/* Menu */}
      <nav className="flex-1 mt-4 px-3">

        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200
              ${
                isActive
                  ? "bg-cyan-500 text-white"
                  : "hover:bg-slate-800 text-slate-300"
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}

      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 transition"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;