import MainLayout from "../../../components/layout/MainLayout";

const Dashboard = () => {
  return (
    <MainLayout>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Monitor your fleet operations in real time.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        Filters will come here
      </div>

      {/* KPI Cards */}
      <div className="mb-6">
        KPI Cards
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-3 gap-6">

        <div className="col-span-2 bg-white rounded-xl shadow p-5">
          Recent Trips Table
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          Vehicle Status Chart
        </div>

      </div>

    </MainLayout>
  );
};

export default Dashboard;