const STATUS_STYLES = {
  Draft: "bg-gray-100 text-gray-500",
  Dispatched: "bg-indigo-100 text-indigo-600",
  "On Trip": "bg-blue-100 text-blue-600",
  Completed: "bg-green-100 text-green-600",
  Cancelled: "bg-red-100 text-red-600",
};

const TripStatusBadge = ({ status }) => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold ${
      STATUS_STYLES[status] || "bg-gray-100 text-gray-500"
    }`}
  >
    {status}
  </span>
);

const RecentTripsTable = ({ trips }) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Recent Trips
      </h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 uppercase text-xs border-b border-gray-100">
            <th className="pb-3 font-medium">Trip</th>
            <th className="pb-3 font-medium">Vehicle</th>
            <th className="pb-3 font-medium">Driver</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">ETA</th>
          </tr>
        </thead>
        <tbody>
          {trips.map((t) => (
            <tr key={t.id} className="border-b border-gray-50 last:border-0">
              <td className="py-3 text-slate-700 font-medium">{t.id}</td>
              <td className="py-3 text-slate-600">{t.vehicle}</td>
              <td className="py-3 text-slate-600">{t.driver}</td>
              <td className="py-3">
                <TripStatusBadge status={t.status} />
              </td>
              <td className="py-3 text-slate-500">{t.eta}</td>
            </tr>
          ))}

          {trips.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-gray-400">
                No recent trips yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Mock data — replace with useTrips() -> tripService.getRecent() later.
export const MOCK_RECENT_TRIPS = [
  { id: "TR001", vehicle: "VAN-05", driver: "Alex", status: "On Trip", eta: "45 min" },
  { id: "TR002", vehicle: "TRK-12", driver: "John", status: "Completed", eta: "—" },
  { id: "TR003", vehicle: "MINI-08", driver: "Priya", status: "Dispatched", eta: "In 10m" },
  { id: "TR004", vehicle: "—", driver: "—", status: "Draft", eta: "Awaiting Vehicle" },
];

export default RecentTripsTable;