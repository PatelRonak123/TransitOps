import { FaPlay, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const MaintenanceTable = ({ records = [], loading = false, onStart, onComplete, onCancel }) => {
  if (loading) {
    return <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">Loading maintenance records...</div>;
  }

  if (!records.length) {
    return <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">No maintenance records found.</div>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full">
        <thead className="bg-orange-50">
          <tr className="text-left text-sm text-gray-600">
            <th className="px-6 py-4">Maintenance</th>
            <th>Vehicle</th>
            <th>Type</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Cost</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-t transition hover:bg-orange-50">
              <td className="px-6 py-5">
                <div className="font-medium text-gray-800">{record.issue_title}</div>
                <div className="text-sm text-gray-500">{record.maintenance_number}</div>
              </td>
              <td>{record.vehicle?.registration_number || "—"}</td>
              <td>{record.maintenance_type}</td>
              <td>{record.priority}</td>
              <td>{record.status}</td>
              <td>${Number(record.estimated_cost || 0).toFixed(2)}</td>
              <td>
                <div className="flex justify-center gap-2">
                  <button onClick={() => onStart(record.id)} className="rounded-lg p-2 text-blue-500 transition hover:bg-blue-50" title="Start maintenance">
                    <FaPlay />
                  </button>
                  <button onClick={() => onComplete(record.id)} className="rounded-lg p-2 text-green-600 transition hover:bg-green-50" title="Complete maintenance">
                    <FaCheckCircle />
                  </button>
                  <button onClick={() => onCancel(record.id)} className="rounded-lg p-2 text-red-500 transition hover:bg-red-50" title="Cancel maintenance">
                    <FaTimesCircle />
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

export default MaintenanceTable;
