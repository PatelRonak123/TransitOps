import MainLayout from "../../../components/layout/MainLayout";
import {
  FaTruck,
  FaCheckCircle,
  FaRoute,
  FaTools,
  FaUsers,
  FaChartLine,
  FaHourglassHalf,
} from "react-icons/fa";
import KPICard from "../components/KPICard";
import FilterBar from "../components/FilterBar";
import RecentTripsTable, {
  MOCK_RECENT_TRIPS,
} from "../components/RecentTripsTable";
import VehicleStatusPanel from "../components/VehicleStatusPanel";

const stats = [
  {
    title: "Active Vehicles",
    value: 53,
    icon: <FaTruck />,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Available Vehicles",
    value: 42,
    icon: <FaCheckCircle />,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "In Maintenance",
    value: 5,
    icon: <FaTools />,
    color: "bg-red-100 text-red-600",
  },
  {
    title: "Active Trips",
    value: 18,
    icon: <FaRoute />,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Pending Trips",
    value: 9,
    icon: <FaHourglassHalf />,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    title: "Drivers On Duty",
    value: 26,
    icon: <FaUsers />,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Fleet Utilization",
    value: "81%",
    icon: <FaChartLine />,
    color: "bg-cyan-100 text-cyan-600",
  },
];

// TODO: derive this from the real vehicles list (useVehicles -> vehicleService)
// once that hook exists. Hardcoded to match the mockup for now.
const vehicleStatusBreakdown = [
  { label: "Available", count: 42 },
  { label: "On Trip", count: 6 },
  { label: "In Shop", count: 5 },
  { label: "Retired", count: 4 },
];

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <FilterBar />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-5">
          {stats.map((item) => (
            <KPICard key={item.title} {...item} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <RecentTripsTable trips={MOCK_RECENT_TRIPS} />
          <VehicleStatusPanel breakdown={vehicleStatusBreakdown} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;