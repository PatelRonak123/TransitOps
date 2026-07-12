import { FaBell, FaSearch } from "react-icons/fa";

const Topbar = () => {
  return (
    <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between">

      {/* Search */}
      <div className="relative w-96">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 outline-none focus:border-orange-400"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">

        <button className="relative">
          <FaBell className="text-2xl text-gray-500" />

          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            3
          </span>
        </button>

        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/100"
            alt=""
            className="h-11 w-11 rounded-full border-2 border-orange-500"
          />

          <div>
            <h3 className="font-semibold">Fleet Manager</h3>
            <p className="text-sm text-gray-500">Admin</p>
          </div>
        </div>

      </div>

    </header>
  );
};

export default Topbar;