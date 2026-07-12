import { useState } from "react";
import { FaTimes } from "react-icons/fa";

const defaultForm = {
  registration_number: "",
  vehicle_name: "",
  vehicle_model: "",
  vehicle_type: "Truck",
  max_load_capacity: "",
  odometer: "0",
  acquisition_cost: "",
  status: "Available",
  region: "",
  notes: "",
};

const toFormData = (vehicle) => ({
  registration_number: vehicle?.registration_number || "",
  vehicle_name: vehicle?.vehicle_name || "",
  vehicle_model: vehicle?.vehicle_model || "",
  vehicle_type: vehicle?.vehicle_type || "Truck",
  max_load_capacity: vehicle?.max_load_capacity ?? "",
  odometer: vehicle?.odometer ?? "0",
  acquisition_cost: vehicle?.acquisition_cost ?? "",
  status: vehicle?.status || "Available",
  region: vehicle?.region || "",
  notes: vehicle?.notes || "",
});

const VehicleModal = ({ open, vehicle, onClose, onSubmit, submitting = false }) => {
  const isEdit = Boolean(vehicle?.id);
  const [formData, setFormData] = useState(() => (isEdit ? toFormData(vehicle) : defaultForm));

  if (!open) return null;

  const isRetired = vehicle?.status === "Retired";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      vehicle_name: formData.vehicle_name.trim(),
      vehicle_model: formData.vehicle_model.trim() || undefined,
      vehicle_type: formData.vehicle_type,
      max_load_capacity: Number(formData.max_load_capacity),
      odometer: Number(formData.odometer || 0),
      acquisition_cost: Number(formData.acquisition_cost),
      status: formData.status,
      region: formData.region.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    };

    if (!isEdit) {
      payload.registration_number = formData.registration_number.trim().toUpperCase();
    }

    if (isRetired) {
      await onSubmit({ notes: formData.notes.trim() || undefined });
      return;
    }

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-4 backdrop-blur-sm sm:px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{isEdit ? "Edit Vehicle" : "Add Vehicle"}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {isEdit ? "Update fleet records and vehicle status." : "Register a vehicle in the fleet."}
            </p>
          </div>

          <button onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 p-4 sm:p-6 md:grid-cols-2 md:gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Registration Number</label>
            <input
              name="registration_number"
              required
              disabled={isEdit}
              value={formData.registration_number}
              onChange={handleChange}
              placeholder="MH12AB1234"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 uppercase focus:border-orange-400 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Vehicle Name</label>
            <input
              name="vehicle_name"
              required
              minLength="2"
              disabled={isRetired}
              value={formData.vehicle_name}
              onChange={handleChange}
              placeholder="Tata Ace"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Model</label>
            <input
              name="vehicle_model"
              disabled={isRetired}
              value={formData.vehicle_model}
              onChange={handleChange}
              placeholder="2026"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Vehicle Type</label>
            <select
              name="vehicle_type"
              value={formData.vehicle_type}
              onChange={handleChange}
              disabled={isRetired}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none disabled:bg-gray-100"
            >
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Pickup">Pickup</option>
              <option value="Trailer">Trailer</option>
              <option value="Mini Truck">Mini Truck</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Max Load Capacity (kg)</label>
            <input
              name="max_load_capacity"
              required
              min="0.01"
              step="0.01"
              type="number"
              disabled={isRetired}
              value={formData.max_load_capacity}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Odometer (km)</label>
            <input
              name="odometer"
              min="0"
              step="0.01"
              type="number"
              disabled={isRetired}
              value={formData.odometer}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Acquisition Cost</label>
            <input
              name="acquisition_cost"
              required
              min="0"
              step="0.01"
              type="number"
              disabled={isRetired}
              value={formData.acquisition_cost}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isRetired}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none disabled:bg-gray-100"
            >
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Region</label>
            <input
              name="region"
              disabled={isRetired}
              value={formData.region}
              onChange={handleChange}
              placeholder="West Zone"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Optional vehicle notes"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t px-1 pt-4 sm:flex-row sm:justify-end md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-6 py-3 text-gray-700 transition hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-orange-500 px-6 py-3 font-medium text-white shadow transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : isEdit ? "Update Vehicle" : "Save Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleModal;
