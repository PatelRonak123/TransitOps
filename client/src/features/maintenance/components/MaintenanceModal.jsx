import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

const defaultForm = {
  vehicle_id: "",
  maintenance_type: "Service",
  issue_title: "",
  description: "",
  workshop_name: "",
  technician_name: "",
  estimated_cost: "",
  priority: "Medium",
  start_date: "",
  expected_completion_date: "",
  remarks: "",
};

const MaintenanceModal = ({ open, onClose, onSubmit, submitting = false }) => {
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
      estimated_cost: Number(formData.estimated_cost || 0),
      vehicle_id: formData.vehicle_id || undefined,
      description: formData.description || undefined,
      remarks: formData.remarks || undefined,
    };
    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-4 backdrop-blur-sm sm:px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Add Maintenance</h2>
            <p className="mt-1 text-sm text-gray-500">Schedule a maintenance task for a vehicle.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Vehicle ID</label>
              <input name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} required className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Maintenance Type</label>
              <select name="maintenance_type" value={formData.maintenance_type} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none">
                <option value="Service">Service</option>
                <option value="Repair">Repair</option>
                <option value="Inspection">Inspection</option>
                <option value="Tyre Replacement">Tyre Replacement</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Issue Title</label>
              <input name="issue_title" value={formData.issue_title} onChange={handleChange} required className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Workshop Name</label>
              <input name="workshop_name" value={formData.workshop_name} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Technician Name</label>
              <input name="technician_name" value={formData.technician_name} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Estimated Cost</label>
              <input name="estimated_cost" type="number" min="0" step="0.01" value={formData.estimated_cost} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Start Date</label>
              <input name="start_date" type="date" value={formData.start_date} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Expected Completion</label>
              <input name="expected_completion_date" type="date" value={formData.expected_completion_date} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Remarks</label>
            <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows="2" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none" />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-300 px-6 py-3 text-gray-700 transition hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded-xl bg-orange-500 px-6 py-3 font-medium text-white shadow transition hover:bg-orange-600 disabled:opacity-60">{submitting ? "Saving..." : "Save Maintenance"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceModal;
