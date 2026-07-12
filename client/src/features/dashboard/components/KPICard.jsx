const KPICard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h2 className="text-4xl font-bold text-slate-800 mt-3">{value}</h2>
        </div>

        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default KPICard;