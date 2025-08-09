import { Filter, RefreshCw, XCircle } from "lucide-react";

const FilterPanel = ({
  filter,
  setFilter,
  clearFilters,
  showAddForm,
  setShowAddForm,
  newLock,
  setNewLock,
  createNewLockId,
  handleAddLock,
  editLockId,
  setEditLockId,
  editLockData,
  setEditLockData,
  handleCancelEdit,
  handleSaveEdit,
  lockIds = [],
   bikeIds = [], 
}) => {

  // Nếu cần, có thể tách AddForm và EditForm riêng, hoặc tích hợp chung như dưới đây.

  return (
    <>
      {/* Add Lock Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Add New Lock</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close add form"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lock ID</label>
              <input
                type="text"
                value={newLock.lockId || createNewLockId()}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddLock}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Thêm Khóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          <button
            onClick={clearFilters}
            className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Clear
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lock ID</label>
         <select
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
  value={filter.lockId}
  onChange={(e) => setFilter({ ...filter, lockId: e.target.value })}
>
  <option value="">All</option>
  {lockIds.map((id) => (
    <option key={id} value={id}>
      {id}
    </option>
  ))}
</select>

          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">All</option>
              <option value="Có Xe, Khóa Đóng">Có Xe, Khóa Đóng</option>
              <option value="Khóa Mở">Khóa Mở</option>
            </select>
          </div>
        <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Bike ID</label>
  <select
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
    value={filter.bikeId}
    onChange={(e) => setFilter({ ...filter, bikeId: e.target.value })}
  >
    <option value="">All</option>
    {bikeIds.map((id) => (
      <option key={id} value={id}>
        {id}
      </option>
    ))}
  </select>
</div>

        </div>
      </div>
    </>
  );
};

export default FilterPanel;
