import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import FuelExpenseFilters from "../components/FuelExpenseFilters";
import FuelExpenseTable from "../components/FuelExpenseTable";
import FuelExpenseModal from "../components/FuelExpenseModal";
import useFuelExpenses from "../hooks/useFuelExpenses";
import useTrips from "../../trips/hooks/useTrips";

const FuelExpenses = () => {
  const [activeTab, setActiveTab] = useState("fuel");
  const [filters, setFilters] = useState({ search: "", type: "", payment_status: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { fuelLogs, expenses, fuelStats, expenseStats, loading, error, fetchData, createFuel, createExpenseEntry, deleteFuel, deleteExpense } = useFuelExpenses();
  const { trips, vehicles, fetchTrips, fetchReferenceData } = useTrips();

  useEffect(() => {
    const normalizedFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ""));
    fetchData({ page: 1, limit: 10, ...normalizedFilters });
  }, [fetchData, filters]);

  useEffect(() => {
    fetchTrips({ page: 1, limit: 100 });
    fetchReferenceData();
  }, [fetchTrips, fetchReferenceData]);

  const records = useMemo(() => (activeTab === "fuel" ? fuelLogs : expenses), [activeTab, fuelLogs, expenses]);
  const stats = activeTab === "fuel" ? fuelStats : expenseStats;

  const handleCreate = async (payload) => {
    try {
      setSubmitting(true);
      if (activeTab === "fuel") {
        await createFuel(payload);
      } else {
        await createExpenseEntry(payload);
      }
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm("Delete this record?")) return;

    if (activeTab === "fuel") {
      await deleteFuel(record.id);
    } else {
      await deleteExpense(record.id);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Fuel & Expenses</h1>
            <p className="mt-2 text-gray-500">Track fuel usage, operational costs, and payment status.</p>
          </div>

          <button onClick={() => setModalOpen(true)} className="rounded-xl bg-orange-500 px-6 py-3 text-white shadow transition hover:bg-orange-600">
            + Add {activeTab === "fuel" ? "Fuel Log" : "Expense"}
          </button>
        </div>

        {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{activeTab === "fuel" ? "Fuel Logs" : "Expenses"}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">{activeTab === "fuel" ? fuelLogs.length : expenses.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{activeTab === "fuel" ? "Total Fuel Cost" : "Total Expenses"}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">${(stats?.totalFuelCost || stats?.totalExpenses || 0).toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">{stats?.pending || 0}</p>
          </div>
        </div>

        <div className="flex gap-2 rounded-2xl bg-white p-2 shadow-sm">
          <button onClick={() => setActiveTab("fuel")} className={`rounded-xl px-4 py-2 font-medium ${activeTab === "fuel" ? "bg-orange-500 text-white" : "text-gray-600"}`}>Fuel</button>
          <button onClick={() => setActiveTab("expenses")} className={`rounded-xl px-4 py-2 font-medium ${activeTab === "expenses" ? "bg-orange-500 text-white" : "text-gray-600"}`}>Expenses</button>
        </div>

        <FuelExpenseFilters filters={filters} onFilterChange={setFilters} loading={loading} />

        <FuelExpenseTable records={records} loading={loading} onDelete={handleDelete} />
      </div>

      <FuelExpenseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        submitting={submitting}
        mode={activeTab === "fuel" ? "fuel" : "expense"}
        trips={trips}
        vehicles={vehicles}
      />
    </MainLayout>
  );
};

export default FuelExpenses;
