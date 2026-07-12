import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import DriverFilters from "../components/DriverFilters";
import { DriverTable } from "../components/DriverTable";
import AddDriverModal from "../components/AddDriverModal";
import DeleteDriverModal from "../components/DeleteDriverModal";
import useDrivers from "../hooks/useDrivers";

export const Drivers = () => {
  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get("search") || "";

  const [openModal, setOpenModal] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [filters, setFilters] = useState({ search: searchParam, status: "", license_category: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: searchParam }));
  }, [searchParam]);
  const { drivers, pagination, stats, loading, error, fetchDrivers, createDriver, removeDriver } = useDrivers();

  const handleDeleteClick = (driver) => {
    setSelectedDriver(driver);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDriver?.id) return;

    await removeDriver(selectedDriver.id);
    setDeleteOpen(false);
    setSelectedDriver(null);
  };
  useEffect(() => {
    const normalizedFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== "")
    );

    fetchDrivers({ page: 1, limit: 10, ...normalizedFilters });
  }, [fetchDrivers, filters]);

  const handleCreateDriver = async (payload) => {
    try {
      setSubmitting(true);
      await createDriver(payload);
      setOpenModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDriver = async (driverId) => {
    if (window.confirm("Delete this driver?")) {
      await removeDriver(driverId);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Drivers</h1>
            <p className="mt-2 text-gray-500">Manage driver profiles, licenses and assignments.</p>
          </div>

          <button
            onClick={() => setOpenModal(true)}
            className="rounded-xl bg-orange-500 px-6 py-3 text-white shadow transition hover:bg-orange-600"
          >
            + Add Driver
          </button>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Drivers</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">{stats?.totalDrivers ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Available</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">{stats?.availableDrivers ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Expired Licenses</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">{stats?.expiredLicenses ?? 0}</p>
          </div>
        </div>

        <DriverFilters filters={filters} onFilterChange={setFilters} loading={loading} />

        <DriverTable drivers={drivers} loading={loading} onDelete={handleDeleteClick} />
        <div className="text-sm text-gray-500">
          Showing {drivers.length} of {pagination.total || 0} drivers
        </div>
      </div>

      <AddDriverModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleCreateDriver}
        submitting={submitting}
      />

      <DeleteDriverModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedDriver(null);
        }}
        onConfirm={confirmDelete}
        driver={selectedDriver}
      />
    </MainLayout>
  );
};

export default Drivers;