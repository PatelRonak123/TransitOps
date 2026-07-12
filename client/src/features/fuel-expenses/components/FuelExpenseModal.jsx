import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

const defaultForm = {
  title: "",
  description: "",
  amount: "",
  expense_type: "Fuel",
  fuel_type: "Diesel",
  fuel_station: "",
  payment_status: "Pending",
  expense_date: "",
  fuel_date: "",
  vehicle_id: "",
  trip_id: "",
  liters: "",
  price_per_liter: "",
  odometer_reading: "",
  remarks: "",
};

const FuelExpenseModal = ({ open, onClose, onSubmit, submitting = false, mode = "expense", trips = [], vehicles = [] }) => {
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
    const payload =
      mode === "fuel"
        ? {
            trip_id: formData.trip_id || undefined,
            vehicle_id: formData.vehicle_id || undefined,
            fuel_type: formData.fuel_type,
            liters: Number(formData.liters || 0),
            price_per_liter: Number(formData.price_per_liter || 0),
            odometer_reading: Number(formData.odometer_reading || 0),
            fuel_date: formData.fuel_date,
            fuel_station: formData.fuel_station || undefined,
            remarks: formData.remarks || undefined,
          }
        : {
            title: formData.title,
            description: formData.description || undefined,
            amount: Number(formData.amount || 0),
            expense_type: formData.expense_type,
            expense_date: formData.expense_date,
            payment_status: formData.payment_status,
            vehicle_id: formData.vehicle_id || undefined,
            trip_id: formData.trip_id || undefined,
            remarks: formData.remarks || undefined,
            fuel_type: formData.fuel_type || undefined,
            fuel_station: formData.fuel_station || undefined,
          };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-4 backdrop-blur-sm sm:px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{mode === "fuel" ? "Add Fuel Log" : "Add Expense"}</h2>
            <p className="mt-1 text-sm text-gray-500">Record a new {mode === "fuel" ? "fuel entry" : "expense entry"} below.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">{mode === "fuel" ? "Fuel Station" : "Title"}</label>
              <input
                name={mode === "fuel" ? "fuel_station" : "title"}
                value={formData[mode === "fuel" ? "fuel_station" : "title"]}
                onChange={handleChange}
                required={mode !== "fuel"}
                placeholder={mode === "fuel" ? "Station name" : "Expense title"}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Amount</label>
              <input
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Date</label>
              <input
                name={mode === "fuel" ? "fuel_date" : "expense_date"}
                type="date"
                value={formData[mode === "fuel" ? "fuel_date" : "expense_date"]}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Payment Status</label>
              <select
                name="payment_status"
                value={formData.payment_status}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
              </select>
            </div>

            {mode === "fuel" ? (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Fuel Type</label>
                  <select name="fuel_type" value={formData.fuel_type} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none">
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="CNG">CNG</option>
                    <option value="Electric">Electric</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Liters</label>
                  <input
                    name="liters"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.liters}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Price Per Liter</label>
                  <input
                    name="price_per_liter"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.price_per_liter}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Odometer Reading</label>
                  <input
                    name="odometer_reading"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.odometer_reading}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Expense Type</label>
                <select name="expense_type" value={formData.expense_type} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none">
                  <option value="Fuel">Fuel</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Toll">Toll</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">{mode === "fuel" ? "Vehicle" : "Vehicle ID"}</label>
              <select
                name="vehicle_id"
                value={formData.vehicle_id}
                onChange={handleChange}
                required={mode === "fuel"}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
              >
                <option value="">{mode === "fuel" ? "Select vehicle" : "Optional"}</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.registration_number || vehicle.registrationNumber} - {vehicle.vehicle_name || vehicle.vehicleName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">{mode === "fuel" ? "Completed Trip" : "Trip ID"}</label>
              <select
                name="trip_id"
                value={formData.trip_id}
                onChange={handleChange}
                required={mode === "fuel"}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none"
              >
                <option value="">{mode === "fuel" ? "Select completed trip" : "Optional"}</option>
                {trips
                  .filter((trip) => (trip.status || trip.trip_status) === "Completed")
                  .map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {trip.trip_number || trip.tripNumber} - {trip.source} to {trip.destination}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Description / Remarks</label>
            <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows="3" placeholder="Optional remarks" className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-orange-400 focus:outline-none" />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-300 px-6 py-3 text-gray-700 transition hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded-xl bg-orange-500 px-6 py-3 font-medium text-white shadow transition hover:bg-orange-600 disabled:opacity-60">{submitting ? "Saving..." : mode === "fuel" ? "Save Fuel Log" : "Save Expense"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FuelExpenseModal;
