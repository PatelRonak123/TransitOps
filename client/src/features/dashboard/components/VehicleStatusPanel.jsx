// Vehicle statuses per spec 3.3: Available, On Trip, In Shop, Retired
const STATUS_BAR_COLORS = {
  Available: "bg-green-500",
  "On Trip": "bg-blue-500",
  "In Shop": "bg-orange-500",
  Retired: "bg-red-500",
};

const VehicleStatusPanel = ({ breakdown }) => {
  const total = breakdown.reduce((sum, b) => sum + b.count, 0) || 1;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-5">
        Vehicle Status
      </h2>

      <div className="space-y-4">
        {breakdown.map(({ label, count }) => (
          <div key={label}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-600">{label}</span>
              <span className="text-gray-400">{count}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`${STATUS_BAR_COLORS[label]} h-2 rounded-full`}
                style={{ width: `${(count / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleStatusPanel;