import { Filter, Calendar, Search } from "lucide-react";

const FilterPanel = ({ filter, setFilter, bikeList }) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-100">
        <div className="flex items-center">
          <Filter className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-800">Bộ lọc tìm kiếm</h3>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {/* Loại Trả Xe */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Loại Trả Xe</label>
            <select
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm shadow-sm"
              value={filter.returnType}
              onChange={(e) => setFilter({ ...filter, returnType: e.target.value })}
            >
              <option value="all">Tất cả</option>
              <option value="normal">Bình thường</option>
              <option value="emergency">Khẩn cấp</option>
            </select>
          </div>

          {/* Mã Người Dùng */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Mã Người Dùng</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm shadow-sm"
                placeholder="Nhập ID"
                value={filter.userId}
                onChange={(e) => setFilter({ ...filter, userId: e.target.value })}
              />
            </div>
          </div>

          {/* Mã Xe Đạp */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Mã Xe Đạp</label>
            <select
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm shadow-sm"
              value={filter.bikeId}
              onChange={(e) => setFilter({ ...filter, bikeId: e.target.value })}
            >
              <option value="">Tất cả</option>
              {bikeList.map((bike) => (
                <option key={bike} value={bike}>
                  {bike}
                </option>
              ))}
            </select>
          </div>

          {/* Trạm */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Trạm</label>
            <select
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm shadow-sm"
              value={filter.stationId}
              onChange={(e) => setFilter({ ...filter, stationId: e.target.value })}
            >
              <option value="">Tất cả</option>
              <option value="station1">station1</option>
              <option value="station2">station2</option>
            </select>
          </div>

          {/* Ngày Thuê */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Ngày Thuê</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm shadow-sm"
                value={filter.borrowed}
                onChange={(e) => setFilter({ ...filter, borrowed: e.target.value })}
              />
            </div>
          </div>

          {/* Ngày Trả */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Ngày Trả</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm shadow-sm"
                value={filter.returned}
                onChange={(e) => setFilter({ ...filter, returned: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
