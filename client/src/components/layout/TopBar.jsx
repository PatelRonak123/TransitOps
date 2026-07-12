import { FaBell, FaSearch } from "react-icons/fa";

const Topbar = () => {
  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">

      {/* Left Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Welcome back! Here's your fleet overview.
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />

          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-72 border rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Notification */}
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <FaBell className="text-xl text-gray-600" />

          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer">
          <img
            src=""
            alt="User"
            className="w-11 h-11 rounded-full border-2 border-cyan-500"
          />

          <div>
            <h3 className="font-semibold text-gray-800">
              Fleet Manager
            </h3>

            <p className="text-sm text-gray-500">
              Admin
            </p>
          </div>
        </div>

      </div>

    </header>
  );
};

export default Topbar;