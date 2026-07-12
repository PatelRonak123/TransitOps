import { FaTrash } from "react-icons/fa";
import { DriverStatusBadge } from "./DriverStatusBadge";

export const DriverTable = ({ drivers = [], loading = false, onDelete }) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">
        Loading drivers...
      </div>
    );
  }

  if (!drivers.length) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">
        No drivers found for the selected filters.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full">
        <thead className="bg-orange-50">
          <tr className="text-left text-sm text-gray-600">
            <th className="px-6 py-4">Driver</th>
            <th>License No.</th>
            <th>Category</th>
            <th>Expiry</th>
            <th>Contact</th>
            <th>Safety Score</th>
            <th>Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {drivers.map((driver) => (
            <tr
              key={driver.id}
              className="border-t transition hover:bg-orange-50"
            >
              <td className="px-6 py-5">
                <div className="font-medium text-gray-800">
                  {driver.full_name}
                </div>
                <div className="text-sm text-gray-500">
                  {driver.email || "No email"}
                </div>
              </td>

              <td>{driver.license_number}</td>
              <td>{driver.license_category}</td>
              <td>{driver.license_expiry_date}</td>
              <td>{driver.contact_number}</td>
              <td>{driver.safety_score ?? "-"}</td>

              <td>
                <DriverStatusBadge status={driver.status} />
              </td>

              <td>
                <div className="flex justify-center">
                  <button
                    onClick={() => onDelete(driver)}
                    className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                    title="Delete Driver"
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

export default DriverTable;