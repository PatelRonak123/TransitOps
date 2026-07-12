import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import authService from "../../features/auth/service/authService";
import { showHttpToast } from "../../lib/httpToast";
import { useAuth } from "../../features/auth/context/AuthContext";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    name: "Vehicles",
    path: "/vehicles",
    icon: <Truck className="h-5 w-5" />,
  },
  {
    name: "Drivers",
    path: "/drivers",
    icon: <Users className="h-5 w-5" />,
  },
  {
    name: "Trips",
    path: "/trips",
    icon: <Route className="h-5 w-5" />,
  },
  {
    name: "Maintenance",
    path: "/maintenance",
    icon: <Wrench className="h-5 w-5" />,
  },
  {
    name: "Fuel & Expenses",
    path: "/fuel-expenses",
    icon: <Fuel className="h-5 w-5" />,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: <SettingsIcon className="h-5 w-5" />,
  },
];

const Sidebar = ({ collapsed, toggleSidebar }) => {
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
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 260 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative h-screen bg-slate-50 border-r border-slate-200/80 flex flex-col shadow-sm overflow-visible"
    >
      {/* Floating Collapse Trigger on Border */}
      <button
        onClick={toggleSidebar}
        className="absolute top-8 -right-3 h-6 w-6 rounded-full bg-white hover:bg-orange-500 border border-slate-200 hover:border-orange-500 flex items-center justify-center text-slate-400 hover:text-white transition duration-200 shadow-sm cursor-pointer z-50"
        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Brand Header */}
      <div className="py-6 border-b border-slate-200/60 flex items-center pl-7 overflow-hidden h-[89px]">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-xl flex items-center justify-center text-white text-xl font-black shadow flex-shrink-0">
            T
          </div>
          
          <motion.div
            initial={false}
            animate={{ 
              opacity: collapsed ? 0 : 1, 
              width: collapsed ? 0 : "auto",
              marginLeft: collapsed ? 0 : 12
            }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="text-left overflow-hidden whitespace-nowrap"
          >
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800 leading-none">
              Transit<span className="text-orange-500">Ops</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-bold mt-1 tracking-wider uppercase">
              Logistics Hub
            </p>
          </motion.div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-grow mt-6 px-0 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            title={collapsed ? item.name : ""}
            className={({ isActive }) =>
              `flex items-center py-3 pl-[28px] pr-4 border-l-4 transition-colors duration-200 group relative mb-1.5
              ${
                isActive
                  ? "bg-orange-50/80 text-orange-600 border-l-orange-500 font-bold"
                  : "text-slate-600 border-l-transparent hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            <motion.span 
              initial={false}
              animate={{ marginRight: collapsed ? 0 : 16 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="flex-shrink-0"
            >
              {item.icon}
            </motion.span>

            <motion.span
              initial={false}
              animate={{ 
                opacity: collapsed ? 0 : 1, 
                width: collapsed ? 0 : "auto" 
              }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="text-sm font-semibold tracking-wide whitespace-nowrap overflow-hidden"
            >
              {item.name}
            </motion.span>

            {/* Custom Tooltip in Collapsed Mode */}
            {collapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 shadow-md whitespace-nowrap">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Action */}
      <div className="border-t border-slate-200/60 p-4">
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : ""}
          className="w-full flex items-center py-3 pl-[24px] pr-4 bg-slate-100 hover:bg-rose-500 text-slate-600 hover:text-white rounded-xl transition-colors duration-200 font-bold text-sm group relative"
        >
          <motion.span
            initial={false}
            animate={{ marginRight: collapsed ? 0 : 12 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="flex-shrink-0"
          >
            <LogOut className="h-5 w-5" />
          </motion.span>
          
          <motion.span
            initial={false}
            animate={{ 
              opacity: collapsed ? 0 : 1, 
              width: collapsed ? 0 : "auto" 
              }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="whitespace-nowrap overflow-hidden"
          >
            Logout
          </motion.span>

          {collapsed && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 shadow-md whitespace-nowrap">
              Logout
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;