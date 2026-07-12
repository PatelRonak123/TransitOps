import { FaEdit, FaTrash } from "react-icons/fa";
import VehicleStatusBadge from "./VehicleStatusBadge";

const formatNumber = (value, suffix = "") => {
  if (value === null || value === undefined || value === "") return "-";
  return `${Number(value).toLocaleString("en-IN")}${suffix}`;
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
};

export const VehicleTable = ({ vehicles = [], loading = false, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">
        Loading vehicles...
      </div>
    );
  }

  if (!vehicles.length) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">
        No vehicles found for the selected filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full min-w-[1050px]">
        <thead className="bg-orange-50">
          <tr className="text-left text-sm text-gray-600">
            <th className="px-6 py-4">Vehicle</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Odometer</th>
            <th>Acquisition Cost</th>
            <th>Region</th>
            <th>Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id} className="border-t transition hover:bg-orange-50">
              <td className="px-6 py-5">
                <div className="font-medium text-gray-800">{vehicle.registration_number}</div>
                <div className="text-sm text-gray-500">
                  {vehicle.vehicle_name}
                  {vehicle.vehicle_model ? ` - ${vehicle.vehicle_model}` : ""}
                </div>
              </td>

              <td>{vehicle.vehicle_type}</td>
              <td>{formatNumber(vehicle.max_load_capacity, " kg")}</td>
              <td>{formatNumber(vehicle.odometer, " km")}</td>
              <td>{formatCurrency(vehicle.acquisition_cost)}</td>
              <td>{vehicle.region || "-"}</td>

              <td>
                <VehicleStatusBadge status={vehicle.status} />
              </td>

              <td>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onEdit(vehicle)}
                    className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                    title="Edit Vehicle"
                  >
                    <FaEdit />
                  </button>

                  <button
                    onClick={() => vehicle.status !== "On Trip" && onDelete(vehicle)}
                    disabled={vehicle.status === "On Trip"}
                    className={`rounded-lg p-2 transition ${
                      vehicle.status === "On Trip"
                        ? "cursor-not-allowed text-gray-400"
                        : "text-red-500 hover:bg-red-50 hover:text-red-700"
                    }`}
                    title={vehicle.status === "On Trip" ? "Cannot delete a vehicle on trip" : "Delete Vehicle"}
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleTable;
