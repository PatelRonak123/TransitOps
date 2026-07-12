const statusStyles = {
  Draft: "bg-slate-100 text-slate-700",
  Dispatched: "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export const TripStatusBadge = ({ status }) => (
  <span
    className={`inline-flex min-w-[104px] items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium ${
      statusStyles[status] || "bg-gray-100 text-gray-700"
    }`}
  >
    {status || "Unknown"}
  </span>
);

export default TripStatusBadge;
