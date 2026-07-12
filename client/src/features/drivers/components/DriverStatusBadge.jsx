const statusStyles = {
  Available: "bg-green-100 text-green-700",
  "On Trip": "bg-blue-100 text-blue-700",
  "Off Duty": "bg-gray-200 text-gray-700",
  Suspended: "bg-orange-100 text-orange-700",
};

export const DriverStatusBadge = ({ status }) => {
  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        min-w-[100px]
        rounded-lg
        px-3
        py-1.5
        text-sm
        font-medium
        ${statusStyles[status] || "bg-gray-100 text-gray-700"}
      `}
    >
      {status}
    </span>
  );
};

export default DriverStatusBadge;