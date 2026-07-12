import { FaSearch } from "react-icons/fa";

const VehicleFilters = ({ filters, onFilterChange, loading }) => {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onFilterChange((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <select
          name="vehicle_type"
          value={filters.vehicle_type || ""}
          onChange={handleChange}
          disabled={loading}
          className="h-12 rounded-xl border border-gray-200 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">All Types</option>
          <option value="Truck">Truck</option>
          <option value="Van">Van</option>
          <option value="Pickup">Pickup</option>
          <option value="Trailer">Trailer</option>
          <option value="Mini Truck">Mini Truck</option>
        </select>

        <select
          name="status"
          value={filters.status || ""}
          onChange={handleChange}
          disabled={loading}
          className="h-12 rounded-xl border border-gray-200 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">All Status</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="In Shop">In Shop</option>
          <option value="Retired">Retired</option>
        </select>

        <input
          type="text"
          name="region"
          value={filters.region || ""}
          onChange={handleChange}
          placeholder="Region"
          disabled={loading}
          className="h-12 rounded-xl border border-gray-200 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            value={filters.search || ""}
            onChange={handleChange}
            placeholder="Search vehicles..."
            disabled={loading}
            className="h-12 w-full rounded-xl border border-gray-200 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>
    </div>
  );
};

export default VehicleFilters;
