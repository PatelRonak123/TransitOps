import { FaCheck, FaPaperPlane, FaTimes, FaTrash } from "react-icons/fa";
import TripStatusBadge from "./TripStatusBadge";

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatNumber = (value, suffix = "") => {
  if (value === null || value === undefined || value === "") return "-";
  return `${Number(value).toLocaleString("en-IN")}${suffix}`;
};

export const TripTable = ({ trips = [], loading = false, onDispatch, onComplete, onCancel, onDelete }) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">
        Loading trips...
      </div>
    );
  }

  if (!trips.length) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">
        No trips found for the selected filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full min-w-[1100px]">
        <thead className="bg-orange-50">
          <tr className="text-left text-sm text-gray-600">
            <th className="px-6 py-4">Trip</th>
            <th>Route</th>
            <th>Vehicle</th>
            <th>Driver</th>
            <th>Cargo</th>
            <th>Distance</th>
            <th>Dispatch</th>
            <th>Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {trips.map((trip) => (
            <tr key={trip.id} className="border-t transition hover:bg-orange-50">
              <td className="px-6 py-5">
                <div className="font-medium text-gray-800">{trip.trip_number}</div>
                <div className="text-sm text-gray-500">{formatDate(trip.created_at)}</div>
              </td>

              <td>
                <div className="font-medium text-gray-800">{trip.source}</div>
                <div className="text-sm text-gray-500">to {trip.destination}</div>
              </td>

              <td>
                <div className="font-medium text-gray-800">{trip.vehicle?.registration_number || "-"}</div>
                <div className="text-sm text-gray-500">{trip.vehicle?.vehicle_name || trip.vehicle?.vehicle_type || "-"}</div>
              </td>

              <td>
                <div className="font-medium text-gray-800">{trip.driver?.full_name || "-"}</div>
                <div className="text-sm text-gray-500">{trip.driver?.contact_number || "-"}</div>
              </td>

              <td>{formatNumber(trip.cargo_weight, " kg")}</td>
              <td>{formatNumber(trip.actual_distance || trip.planned_distance, " km")}</td>
              <td>{formatDate(trip.dispatch_date)}</td>

              <td>
                <TripStatusBadge status={trip.status} />
              </td>

              <td>
                <div className="flex justify-center gap-2">
                  {trip.status === "Draft" ? (
                    <button
                      onClick={() => onDispatch(trip)}
                      className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                      title="Dispatch Trip"
                    >
                      <FaPaperPlane />
                    </button>
                  ) : null}

                  {trip.status === "Dispatched" ? (
                    <button
                      onClick={() => onComplete(trip)}
                      className="rounded-lg p-2 text-green-600 transition hover:bg-green-50"
                      title="Complete Trip"
                    >
                      <FaCheck />
                    </button>
                  ) : null}

                  {trip.status === "Draft" || trip.status === "Dispatched" ? (
                    <button
                      onClick={() => onCancel(trip)}
                      className="rounded-lg p-2 text-orange-500 transition hover:bg-orange-100"
                      title="Cancel Trip"
                    >
                      <FaTimes />
                    </button>
                  ) : null}

                  {trip.status === "Draft" || trip.status === "Cancelled" ? (
                    <button
                      onClick={() => onDelete(trip)}
                      className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                      title="Delete Trip"
                    >
                      <FaTrash />
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TripTable;
