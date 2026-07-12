import { FaTrash } from "react-icons/fa";

const FuelExpenseTable = ({ records = [], loading = false, onDelete }) => {
  if (loading) {
    return <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">Loading records...</div>;
  }

  if (!records.length) {
    return <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">No records found.</div>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full">
        <thead className="bg-orange-50">
          <tr className="text-left text-sm text-gray-600">
            <th className="px-6 py-4">Reference</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Vehicle / Trip</th>
            <th>Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-t transition hover:bg-orange-50">
              <td className="px-6 py-5">
                <div className="font-medium text-gray-800">{record.title || record.fuel_log_number || record.expense_number}</div>
                <div className="text-sm text-gray-500">{record.description || record.fuel_station || record.vendor_name || "—"}</div>
              </td>
              <td>{record.expense_type || record.fuel_type || "—"}</td>
              <td className="font-semibold text-slate-800">${Number(record.amount || record.total_cost || 0).toFixed(2)}</td>
              <td>{record.expense_date || record.fuel_date || "—"}</td>
              <td>{record.vehicle?.registration_number || record.trip?.trip_number || "—"}</td>
              <td>{record.payment_status || record.status || "—"}</td>
              <td>
                <div className="flex justify-center">
                  <button onClick={() => onDelete(record)} className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700" title="Delete record">
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

export default FuelExpenseTable;
