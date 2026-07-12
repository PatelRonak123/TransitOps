import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

const defaultForm = {
  full_name: "",
  contact_number: "",
  license_number: "",
  license_category: "LMV",
  license_expiry_date: "",
  status: "Available",
  email: "",
  address: "",
  emergency_contact: "",
  safety_score: "100",
  notes: "",
};

const AddDriverModal = ({ open, onClose, onSubmit, submitting = false }) => {
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    if (!open) {
      setFormData(defaultForm);
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      safety_score: Number(formData.safety_score || 100),
      email: formData.email.trim() || undefined,
      address: formData.address.trim() || undefined,
      emergency_contact: formData.emergency_contact.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-4 backdrop-blur-sm sm:px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Add Driver</h2>
            <p className="mt-1 text-sm text-gray-500">Enter driver information below.</p>
          </div>

          <button onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 p-4 sm:p-6 md:grid-cols-2 md:gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Driver Name</label>
            <input
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter name"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Contact Number</label>
            <input
              name="contact_number"
              required
              value={formData.contact_number}
              onChange={handleChange}
              placeholder="9876543210"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">License Number</label>
            <input
              name="license_number"
              required
              value={formData.license_number}
              onChange={handleChange}
              placeholder="DL-123456"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">License Category</label>
            <select
              name="license_category"
              value={formData.license_category}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            >
              <option value="LMV">LMV</option>
              <option value="HMV">HMV</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">License Expiry</label>
            <input
              name="license_expiry_date"
              required
              type="date"
              value={formData.license_expiry_date}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            >
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="Off Duty">Off Duty</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="driver@example.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Emergency Contact</label>
            <input
              name="emergency_contact"
              value={formData.emergency_contact}
              onChange={handleChange}
              placeholder="9876543210"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Safety Score</label>
            <input
              name="safety_score"
              type="number"
              min="0"
              max="100"
              value={formData.safety_score}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street / City"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Optional remarks"
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
              {submitting ? "Saving..." : "Save Driver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDriverModal;