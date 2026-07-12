import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import MaintenanceFilters from "../components/MaintenanceFilters";
import MaintenanceTable from "../components/MaintenanceTable";
import MaintenanceModal from "../components/MaintenanceModal";
import useMaintenance from "../hooks/useMaintenance";
import useVehicles from "../../vehicles/hooks/useVehicles";

const MaintenancePage = () => {
  const [filters, setFilters] = useState({ search: "", status: "", priority: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { records, stats, loading, error, fetchData, createRecord, startRecord, completeRecord, cancelRecord } = useMaintenance();
  const { vehicles, fetchVehicles } = useVehicles();

  useEffect(() => {
    const normalizedFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ""));
    fetchData({ page: 1, limit: 10, ...normalizedFilters });
  }, [fetchData, filters]);

  useEffect(() => {
    fetchVehicles({ page: 1, limit: 100, status: "Available" });
  }, [fetchVehicles]);

  const handleCreate = async (payload) => {
    try {
      setSubmitting(true);
      await createRecord(payload);
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStart = async (id) => {
    await startRecord(id);
  };

  const handleComplete = async (id) => {
    await completeRecord(id, { actual_cost: 0, completion_date: new Date().toISOString().split("T")[0] });
  };

  const handleCancel = async (id) => {
    await cancelRecord(id);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Maintenance</h1>
            <p className="mt-2 text-gray-500">Monitor vehicle maintenance schedules, status, and costs.</p>
          </div>

          <button onClick={() => setModalOpen(true)} className="rounded-xl bg-orange-500 px-6 py-3 text-white shadow transition hover:bg-orange-600">
            + Add Maintenance
          </button>
        </div>

        {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Records</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">{stats?.totalMaintenance || 0}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">{stats?.inProgressMaintenance || 0}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">{stats?.completedMaintenance || 0}</p>
          </div>
        </div>

        <MaintenanceFilters filters={filters} onFilterChange={setFilters} loading={loading} />
        <MaintenanceTable records={records} loading={loading} onStart={handleStart} onComplete={handleComplete} onCancel={handleCancel} />
      </div>

      <MaintenanceModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} submitting={submitting} vehicles={vehicles} />
    </MainLayout>
  );
};

export default MaintenancePage;
