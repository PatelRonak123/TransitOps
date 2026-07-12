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
    <aside className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">

      {/* Logo */}

      <div className="px-8 py-8 border-b border-gray-100">

        <h1 className="text-4xl font-bold text-orange-500">
          TransitOps
        </h1>

        <p className="text-gray-500 mt-2">
          Smart Transport Platform
        </p>

      </div>

      {/* Menu */}

      <nav className="flex-1 mt-6 px-5">

        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-4 rounded-2xl mb-2 transition-all duration-300
              ${
                isActive
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>

            <span className="font-medium">
              {item.name}
            </span>
          </NavLink>
        ))}

      </nav>

      {/* Logout */}

      <div className="p-5 border-t border-gray-100">

        <button
          className="
          w-full
          flex
          items-center
          justify-center
          gap-3
          bg-red-50
          hover:bg-red-500
          text-red-500
          hover:text-white
          py-4
          rounded-2xl
          transition-all
          duration-300
          font-semibold
          "
           onClick={handleLogout}
        >
          <FaSignOutAlt />

          Logout

        </button>

      </div>

    </aside>
  );
};

export default Sidebar;