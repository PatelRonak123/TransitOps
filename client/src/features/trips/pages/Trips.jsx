import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import AddTripModal from "../components/AddTripModal";
import CompleteTripModal from "../components/CompleteTripModal";
import TripFilters from "../components/TripFilters";
import TripTable from "../components/TripTable";
import useTrips from "../hooks/useTrips";

const StatCard = ({ label, value }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-slate-800">{value ?? 0}</p>
  </div>
);

export const Trips = () => {
  const [openModal, setOpenModal] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [filters, setFilters] = useState({ search: "", status: "", start_date: "", end_date: "" });
  const [submitting, setSubmitting] = useState(false);
  const {
    trips,
    pagination,
    stats,
    vehicles,
    drivers,
    loading,
    referenceLoading,
    error,
    fetchTrips,
    fetchStats,
    fetchReferenceData,
    createTrip,
    removeTrip,
    dispatchTrip,
    completeTrip,
    cancelTrip,
  } = useTrips();

  useEffect(() => {
    fetchStats();
    fetchReferenceData();
  }, [fetchReferenceData, fetchStats]);

  useEffect(() => {
    const normalizedFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== "")
    );

    fetchTrips({ page: 1, limit: 10, ...normalizedFilters });
  }, [fetchTrips, filters]);

  const handleCreateTrip = async (payload) => {
    try {
      setSubmitting(true);
      await createTrip(payload);
      setOpenModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispatchTrip = async (trip) => {
    if (window.confirm(`Dispatch ${trip.trip_number}?`)) {
      await dispatchTrip(trip.id);
    }
  };

  const handleCompleteClick = (trip) => {
    setSelectedTrip(trip);
    setCompleteOpen(true);
  };

  const handleCompleteTrip = async (payload) => {
    if (!selectedTrip?.id) return;

    try {
      setSubmitting(true);
      await completeTrip(selectedTrip.id, payload);
      setCompleteOpen(false);
      setSelectedTrip(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelTrip = async (trip) => {
    if (window.confirm(`Cancel ${trip.trip_number}?`)) {
      await cancelTrip(trip.id);
    }
  };

  const handleDeleteTrip = async (trip) => {
    if (window.confirm(`Delete ${trip.trip_number}? This action cannot be undone.`)) {
      await removeTrip(trip.id);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Trips</h1>
            <p className="mt-2 text-gray-500">Plan routes, assign vehicles and track trip progress.</p>
          </div>

          <button
            onClick={() => setOpenModal(true)}
            className="rounded-xl bg-orange-500 px-6 py-3 text-white shadow transition hover:bg-orange-600"
          >
            + Create Trip
          </button>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <StatCard label="Total Trips" value={stats?.totalTrips} />
          <StatCard label="Draft" value={stats?.draftTrips} />
          <StatCard label="Dispatched" value={stats?.activeTrips} />
          <StatCard label="Completed" value={stats?.completedTrips} />
          <StatCard label="Cancelled" value={stats?.cancelledTrips} />
        </div>

        <TripFilters filters={filters} onFilterChange={setFilters} loading={loading} />

        <TripTable
          trips={trips}
          loading={loading}
          onDispatch={handleDispatchTrip}
          onComplete={handleCompleteClick}
          onCancel={handleCancelTrip}
          onDelete={handleDeleteTrip}
        />

        <div className="text-sm text-gray-500">
          Showing {trips.length} of {pagination.total || 0} trips
        </div>
      </div>

      <AddTripModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleCreateTrip}
        vehicles={vehicles}
        drivers={drivers}
        submitting={submitting}
        loading={referenceLoading}
      />

      <CompleteTripModal
        open={completeOpen}
        trip={selectedTrip}
        onClose={() => {
          setCompleteOpen(false);
          setSelectedTrip(null);
        }}
        onSubmit={handleCompleteTrip}
        submitting={submitting}
      />
    </MainLayout>
  );
};

export default Trips;
