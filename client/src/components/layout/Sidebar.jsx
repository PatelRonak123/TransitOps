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
  ChevronRight,
  Brain
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
    name: "AI Diagnostics",
    path: "/ai-diagnostics",
    icon: <Brain className="h-5 w-5" />,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: <SettingsIcon className="h-5 w-5" />,
  },
];

const Sidebar = ({ collapsed, toggleSidebar }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      const response = await authService.logout();
      showHttpToast(200, response?.message || "Logged out successfully.");
    } finally {
      logout();
      navigate("/", { replace: true });
    }
  };

  const roleFeatures = {
    "Fleet Manager": ["Vehicles", "Maintenance", "AI Diagnostics", "Settings"],
    "Dispatcher": ["Dashboard", "Trips", "Settings"],
    "Safety Officer": ["Drivers", "Settings"],
    "Financial Analyst": ["Fuel & Expenses", "Reports", "Settings"]
  };

  const allowedFeatures = roleFeatures[user?.role] || [];
  const filteredItems = menuItems.filter(item => allowedFeatures.includes(item.name));

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 260 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative h-screen bg-[#121212] flex flex-col shadow-xl overflow-visible border-r border-[#27272A]"
    >
      {/* Floating Collapse Trigger on Border */}
      <button
        onClick={toggleSidebar}
        className="absolute top-8 -right-3 h-6 w-6 rounded-full bg-[#121212] hover:bg-orange-500 border border-[#27272A] hover:border-orange-500 flex items-center justify-center text-zinc-400 hover:text-white transition duration-200 shadow-md cursor-pointer z-50 animate-none"
        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Brand Header */}
      <div className="py-6 border-b border-[#27272A] flex items-center pl-7 overflow-hidden h-[89px]">
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
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">
              Transit<span className="text-orange-500">Ops</span>
            </h1>
            <p className="text-zinc-500 text-[10px] font-bold mt-1 tracking-wider uppercase">
              Logistics Hub
            </p>
          </motion.div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-grow mt-6 px-3 overflow-y-auto overflow-x-hidden">
        {filteredItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            title={collapsed ? item.name : ""}
            className={({ isActive }) =>
              `flex items-center py-3 pl-[16px] rounded-xl mb-1.5 transition-all duration-200 group relative
              ${
                isActive
                  ? "bg-white/10 text-white font-bold shadow-sm"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <motion.span 
              initial={false}
              animate={{ marginRight: collapsed ? 0 : 14 }}
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
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#1A1A1A] text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 shadow-md whitespace-nowrap border border-[#27272A]">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Action */}
      <div className="border-t border-[#27272A] p-4">
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : ""}
          className="w-full flex items-center py-3 pl-[16px] bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 rounded-xl transition-all duration-200 font-bold text-sm group relative border border-transparent hover:border-rose-500/20"
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
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#1A1A1A] text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 shadow-md whitespace-nowrap border border-[#27272A]">
              Logout
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;