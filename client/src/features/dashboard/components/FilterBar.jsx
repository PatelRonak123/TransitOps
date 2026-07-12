const selectClass =
  "border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400";

const FilterBar = ({
  vehicleTypes = ["Vehicle Type", "Van", "Truck", "Mini", "Bus"],
  statuses = ["Status", "Available", "On Trip", "In Shop", "Retired"],
  regions = ["Region", "North", "South", "East", "West"],
  onFilterChange = () => {},
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <p className="text-xs font-semibold text-gray-400 tracking-wide mb-3">
        FILTERS
      </p>

      <div className="flex flex-wrap gap-4">
        <select
          className={selectClass}
          onChange={(e) => onFilterChange("vehicleType", e.target.value)}
        >
          {vehicleTypes.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>

        <select
          className={selectClass}
          onChange={(e) => onFilterChange("status", e.target.value)}
        >
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select
          className={selectClass}
          onChange={(e) => onFilterChange("region", e.target.value)}
        >
          {regions.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;