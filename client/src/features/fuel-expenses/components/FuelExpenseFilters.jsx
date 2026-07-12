import { FaSearch } from "react-icons/fa";

const FuelExpenseFilters = ({ filters, onFilterChange, loading }) => {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onFilterChange((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <select
          name="type"
          value={filters.type || ""}
          onChange={handleChange}
          disabled={loading}
          className="h-12 rounded-xl border border-gray-200 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">All Types</option>
          <option value="Fuel">Fuel</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Toll">Toll</option>
          <option value="Other">Other</option>
        </select>

        <select
          name="payment_status"
          value={filters.payment_status || ""}
          onChange={handleChange}
          disabled={loading}
          className="h-12 rounded-xl border border-gray-200 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">All Payments</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Partially Paid">Partially Paid</option>
        </select>

        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            value={filters.search || ""}
            onChange={handleChange}
            placeholder="Search records..."
            disabled={loading}
            className="h-12 w-full rounded-xl border border-gray-200 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>
    </div>
  );
};

export default FuelExpenseFilters;
