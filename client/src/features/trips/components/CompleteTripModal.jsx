import { useState } from "react";
import { FaTimes } from "react-icons/fa";

const defaultForm = {
  end_odometer: "",
  actual_distance: "",
  fuel_consumed: "",
};

const CompleteTripModal = ({ open, trip, onClose, onSubmit, submitting = false }) => {
  const [formData, setFormData] = useState(defaultForm);

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit({
      end_odometer: Number(formData.end_odometer),
      actual_distance: Number(formData.actual_distance),
      fuel_consumed: Number(formData.fuel_consumed),
    });
    setFormData(defaultForm);
  };

  const handleClose = () => {
    setFormData(defaultForm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-4 backdrop-blur-sm sm:px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Complete Trip</h2>
            <p className="mt-1 text-sm text-gray-500">{trip?.trip_number || "Trip"} completion details.</p>
          </div>

          <button onClick={handleClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 p-6">
          <div className="rounded-xl bg-orange-50 px-4 py-3 text-sm text-gray-700">
            Start odometer: <span className="font-semibold">{trip?.start_odometer ?? "-"}</span>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">End Odometer</label>
            <input
              name="end_odometer"
              required
              min="0.01"
              step="0.01"
              type="number"
              value={formData.end_odometer}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Actual Distance (km)</label>
            <input
              name="actual_distance"
              required
              min="0.01"
              step="0.01"
              type="number"
              value={formData.actual_distance}
              onChange={handleChange}
              placeholder={trip?.planned_distance ? String(trip.planned_distance) : ""}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Fuel Consumed</label>
            <input
              name="fuel_consumed"
              required
              min="0"
              step="0.01"
              type="number"
              value={formData.fuel_consumed}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t px-1 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-gray-300 px-6 py-3 text-gray-700 transition hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-orange-500 px-6 py-3 font-medium text-white shadow transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Completing..." : "Complete Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteTripModal;
