import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import VehicleFilters from "../components/VehicleFilters";
import VehicleModal from "../components/VehicleModal";
import VehicleTable from "../components/VehicleTable";
import useVehicles from "../hooks/useVehicles";

const StatCard = ({ label, value }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-slate-800">{value ?? 0}</p>
  </div>
);

export const Vehicles = () => {
  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get("search") || "";

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [filters, setFilters] = useState({ search: searchParam, status: "", vehicle_type: "", region: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: searchParam }));
  }, [searchParam]);
  const {
    vehicles,
    pagination,
    stats,
    loading,
    error,
    fetchVehicles,
    fetchStats,
    createVehicle,
    updateVehicle,
    removeVehicle,
  } = useVehicles();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const normalizedFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== "")
    );

    fetchVehicles({ page: 1, limit: 10, ...normalizedFilters });
  }, [fetchVehicles, filters]);

  const handleAddClick = () => {
    setSelectedVehicle(null);
    setModalOpen(true);
  };

  const handleEditClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleSaveVehicle = async (payload) => {
    try {
      setSubmitting(true);

      if (selectedVehicle?.id) {
        await updateVehicle(selectedVehicle.id, payload);
      } else {
        await createVehicle(payload);
      }

      handleCloseModal();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (vehicle) => {
    if (window.confirm(`Delete ${vehicle.registration_number}? This action cannot be undone.`)) {
      await removeVehicle(vehicle.id);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Vehicles</h1>
            <p className="mt-2 text-gray-500">Manage fleet records, capacity, odometer and availability.</p>
          </div>

          <button
            onClick={handleAddClick}
            className="rounded-xl bg-orange-500 px-6 py-3 text-white shadow transition hover:bg-orange-600"
          >
            + Add Vehicle
          </button>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <StatCard label="Total Vehicles" value={stats?.totalVehicles} />
          <StatCard label="Available" value={stats?.availableVehicles} />
          <StatCard label="On Trip" value={stats?.onTripVehicles} />
          <StatCard label="In Shop" value={stats?.maintenanceVehicles} />
          <StatCard label="Retired" value={stats?.retiredVehicles} />
        </div>

        <VehicleFilters filters={filters} onFilterChange={setFilters} loading={loading} />

        <VehicleTable
          vehicles={vehicles}
          loading={loading}
          onEdit={handleEditClick}
          onDelete={handleDeleteVehicle}
        />

        <div className="text-sm text-gray-500">
          Showing {vehicles.length} of {pagination.total || 0} vehicles
        </div>
      </div>

      {modalOpen ? (
        <VehicleModal
          key={selectedVehicle?.id || "new"}
          open={modalOpen}
          vehicle={selectedVehicle}
          onClose={handleCloseModal}
          onSubmit={handleSaveVehicle}
          submitting={submitting}
        />
      ) : null}
    </MainLayout>
  );
};

export default Vehicles;
