import { useState } from "react";
import { FaTimes } from "react-icons/fa";

const defaultForm = {
  vehicle_id: "",
  driver_id: "",
  source: "",
  destination: "",
  cargo_weight: "",
  planned_distance: "",
  revenue: "",
  remarks: "",
};

const toOptionalNumber = (value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  return Number(value);
};

const AddTripModal = ({ open, onClose, onSubmit, vehicles = [], drivers = [], submitting = false, loading = false }) => {
  const [formData, setFormData] = useState(defaultForm);

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      vehicle_id: formData.vehicle_id,
      driver_id: formData.driver_id,
      source: formData.source.trim(),
      destination: formData.destination.trim(),
      cargo_weight: Number(formData.cargo_weight),
      planned_distance: toOptionalNumber(formData.planned_distance),
      revenue: toOptionalNumber(formData.revenue),
      remarks: formData.remarks.trim() || undefined,
    };

    await onSubmit(payload);
    setFormData(defaultForm);
  };

  const handleClose = () => {
    setFormData(defaultForm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-4 backdrop-blur-sm sm:px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Create Trip</h2>
            <p className="mt-1 text-sm text-gray-500">Plan route, vehicle, driver and load details.</p>
          </div>

          <button onClick={handleClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 p-4 sm:p-6 md:grid-cols-2 md:gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Vehicle</label>
            <select
              name="vehicle_id"
              required
              value={formData.vehicle_id}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            >
              <option value="">{loading ? "Loading vehicles..." : "Select vehicle"}</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.registration_number} - {vehicle.vehicle_name || vehicle.vehicle_type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Driver</label>
            <select
              name="driver_id"
              required
              value={formData.driver_id}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            >
              <option value="">{loading ? "Loading drivers..." : "Select driver"}</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.full_name} - {driver.license_category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Source</label>
            <input
              name="source"
              required
              value={formData.source}
              onChange={handleChange}
              placeholder="Pickup location"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Destination</label>
            <input
              name="destination"
              required
              value={formData.destination}
              onChange={handleChange}
              placeholder="Drop location"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Cargo Weight (kg)</label>
            <input
              name="cargo_weight"
              required
              min="0.01"
              step="0.01"
              type="number"
              value={formData.cargo_weight}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Planned Distance (km)</label>
            <input
              name="planned_distance"
              min="0.01"
              step="0.01"
              type="number"
              value={formData.planned_distance}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Revenue</label>
            <input
              name="revenue"
              min="0"
              step="0.01"
              type="number"
              value={formData.revenue}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="3"
              placeholder="Optional trip notes"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t px-1 pt-4 sm:flex-row sm:justify-end md:col-span-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-gray-300 px-6 py-3 text-gray-700 transition hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || loading}
              className="rounded-xl bg-orange-500 px-6 py-3 font-medium text-white shadow transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTripModal;
