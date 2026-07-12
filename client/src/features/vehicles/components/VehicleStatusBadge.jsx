const statusStyles = {
  Available: "bg-green-100 text-green-700",
  "On Trip": "bg-blue-100 text-blue-700",
  "In Shop": "bg-orange-100 text-orange-700",
  Retired: "bg-gray-200 text-gray-700",
};

export const VehicleStatusBadge = ({ status }) => (
  <span
    className={`inline-flex min-w-[104px] items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium ${
      statusStyles[status] || "bg-gray-100 text-gray-700"
    }`}
  >
    {status || "Unknown"}
  </span>
);

export default VehicleStatusBadge;
