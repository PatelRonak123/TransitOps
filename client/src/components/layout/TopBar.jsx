import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaSearch } from "react-icons/fa";
import { Truck, Users, Route, Loader2, Search, X } from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";
import dashboardService from "../../features/dashboard/service/dashboardService";

const Topbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Search States
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ vehicles: [], drivers: [], trips: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search results on query change
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const trimmed = query.trim();
      if (trimmed.length >= 2) {
        setLoading(true);
        setIsOpen(true);
        try {
          const res = await dashboardService.searchSystem(trimmed);
          if (res.success) {
            setResults(res.data || { vehicles: [], drivers: [], trips: [] });
          }
        } catch (err) {
          console.error("System search error:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults({ vehicles: [], drivers: [], trips: [] });
        if (trimmed.length === 0) {
          setIsOpen(false);
        }
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Navigate to corresponding list with search query applied
  const handleItemClick = (category, searchVal) => {
    setIsOpen(false);
    setQuery("");
    
    // Redirect corresponding page carrying filter params
    if (category === "vehicles") {
      navigate(`/vehicles?search=${encodeURIComponent(searchVal)}`);
    } else if (category === "drivers") {
      navigate(`/drivers?search=${encodeURIComponent(searchVal)}`);
    } else if (category === "trips") {
      navigate(`/trips?search=${encodeURIComponent(searchVal)}`);
    }
  };

  const hasResults = 
    results.vehicles.length > 0 || 
    results.drivers.length > 0 || 
    results.trips.length > 0;

  return (
    <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between z-40 relative">
      
      <div className="flex items-center gap-4 flex-1">
        {/* Search Container */}
        <div ref={searchRef} className="relative w-72 md:w-96">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles, drivers, trips..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-11 pr-10 outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-500 transition text-sm"
            />
            {query && (
              <button 
                onClick={() => { setQuery(""); setIsOpen(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search Dropdown Panel */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-full md:w-[460px] bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 z-50 text-left max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                  <p className="text-xs font-medium">Searching system database...</p>
                </div>
              ) : !hasResults ? (
                <div className="py-8 text-center text-slate-400">
                  <Search className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold">No matches found</p>
                  <p className="text-xs">No records correspond to "{query}"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Vehicles Section */}
                  {results.vehicles.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <Truck className="h-3.5 w-3.5" />
                        <span>Vehicles</span>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {results.vehicles.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => handleItemClick("vehicles", v.registrationNumber)}
                            className="w-full text-left py-2 px-3 hover:bg-slate-50 rounded-xl transition flex items-center justify-between text-sm"
                          >
                            <div>
                              <p className="font-semibold text-slate-700">{v.registrationNumber}</p>
                              <p className="text-xs text-slate-400">{v.vehicleName}</p>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              v.status === "Available" ? "bg-emerald-50 text-emerald-700" :
                              v.status === "On Trip" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                            }`}>
                              {v.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drivers Section */}
                  {results.drivers.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <Users className="h-3.5 w-3.5" />
                        <span>Drivers</span>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {results.drivers.map((d) => (
                          <button
                            key={d.id}
                            onClick={() => handleItemClick("drivers", d.fullName)}
                            className="w-full text-left py-2 px-3 hover:bg-slate-50 rounded-xl transition flex items-center justify-between text-sm"
                          >
                            <div>
                              <p className="font-semibold text-slate-700">{d.fullName}</p>
                              <p className="text-xs text-slate-400">{d.contactNumber}</p>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                              {d.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trips Section */}
                  {results.trips.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <Route className="h-3.5 w-3.5" />
                        <span>Trips</span>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {results.trips.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => handleItemClick("trips", t.tripNumber)}
                            className="w-full text-left py-2 px-3 hover:bg-slate-50 rounded-xl transition flex items-center justify-between text-sm"
                          >
                            <div>
                              <p className="font-semibold text-slate-700">#{t.tripNumber}</p>
                              <p className="text-xs text-slate-400">{t.source} → {t.destination}</p>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              t.status === "Completed" ? "bg-emerald-50 text-emerald-700" :
                              t.status === "On Trip" ? "bg-blue-50 text-blue-700" : "bg-indigo-50 text-indigo-700"
                            }`}>
                              {t.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right User Bar */}
      <div className="flex items-center gap-6">

        <button className="relative p-2 hover:bg-slate-50 rounded-xl transition text-slate-500">
          <FaBell className="text-xl" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <div className="flex items-center gap-3">
          {/* Initials-based Profile Avatar Circle */}
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-extrabold text-sm border-2 border-orange-500 flex items-center justify-center shadow-sm select-none">
            {user?.firstName ? `${user.firstName[0].toUpperCase()}${user.lastName ? user.lastName[0].toUpperCase() : ""}` : (user?.email ? user.email[0].toUpperCase() : "A")}
          </div>

          <div className="hidden md:block text-left">
            <h3 className="font-bold text-sm text-slate-800 leading-tight">
              {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Admin"}
            </h3>
            <p className="text-xs text-slate-400 font-semibold">{user?.role || "Fleet Manager"}</p>
          </div>
        </div>

      </div>

    </header>
  );
};

export default Topbar;