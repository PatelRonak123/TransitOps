import { FaSearch } from "react-icons/fa";

const DriverFilters = ({ filters, onFilterChange, loading }) => {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onFilterChange((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <select
          name="license_category"
          value={filters.license_category || ""}
          onChange={handleChange}
          disabled={loading}
          className="h-12 rounded-xl border border-gray-200 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">All Categories</option>
          <option value="LMV">LMV</option>
          <option value="HMV">HMV</option>
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
          <option value="Off Duty">Off Duty</option>
          <option value="Suspended">Suspended</option>
        </select>

        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            value={filters.search || ""}
            onChange={handleChange}
            placeholder="Search driver..."
            disabled={loading}
            className="h-12 w-full rounded-xl border border-gray-200 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>
    </div>
  );
};

export default DriverFilters;