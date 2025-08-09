import { Filter, RefreshCw } from "lucide-react";

export default function FilterPanel({ filter, setFilter, clearFilter, bikes = [] }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-300 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <button
          onClick={clearFilter}
          className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Clear
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
          <input
            type="search"
            value={filter.userId}
            onChange={(e) => setFilter({ ...filter, userId: e.target.value })}
            placeholder="Search User ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="search"
            value={filter.email}
            onChange={(e) => setFilter({ ...filter, email: e.target.value })}
            placeholder="Search Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="search"
            value={filter.name}
            onChange={(e) => setFilter({ ...filter, name: e.target.value })}
            placeholder="Search Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
          <input
            type="number"
            min={0}
            value={filter.age}
            onChange={(e) => setFilter({ ...filter, age: e.target.value })}
            placeholder="Search Age"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <select
            value={filter.gender}
            onChange={(e) => setFilter({ ...filter, gender: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="nam">Nam</option>
            <option value="nữ">Nữ</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Selected Bike</label>
          <select
            value={filter.selectedBikeId}
            onChange={(e) => setFilter({ ...filter, selectedBikeId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Bikes</option>
            <option value="none">None</option>
            {bikes.map((bikeId, i) => (
              <option key={bikeId || i} value={bikeId}>
                {bikeId}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select
            value={filter.role}
            onChange={(e) => setFilter({ ...filter, role: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
    </div>
  );
}
