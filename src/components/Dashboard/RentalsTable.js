import { Bike, MapPin, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

const RentalsTable = ({ rentals, currentPage, totalPages, goToPage, totalRecords }) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Dữ liệu thuê xe</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
              Tổng cộng: <span className="font-bold">{totalRecords}</span> bản ghi
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Người Dùng</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Xe Đạp</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Trạm</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ngày Thuê</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ngày Trả</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Thời Gian</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rentals.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16">
                  <div className="text-gray-400 text-6xl mb-6">📊</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Không tìm thấy dữ liệu</h3>
                  <p className="text-gray-500">Không có lịch sử thuê xe nào phù hợp với tiêu chí tìm kiếm.</p>
                </td>
              </tr>
            ) : (
              rentals.map((rental) => (
                <tr key={rental.id} className="hover:bg-blue-50/30 transition-all duration-200 group">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mr-4 shadow-sm"></div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{rental.userId?.slice(0, 8)}...</div>
                        <div className="text-xs text-gray-500">ID: {rental.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center">
                      <Bike className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm">
                        {rental.bikeId}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-green-500 mr-2" />
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm">
                        {rental.stationId}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                      <div className="text-sm font-semibold text-gray-900">
                        {new Date(rental.borrowTimestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(rental.borrowTimestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    {rental.returnTimestamp ? (
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <div className="text-sm font-semibold text-gray-900">
                          {new Date(rental.returnTimestamp).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(rental.returnTimestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 shadow-sm">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                        Đang xử lý
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg px-4 py-2 shadow-sm">
                      <span className="font-mono text-sm font-bold text-gray-800">
                        {Math.floor((rental.duration || 0) / 1000)}s
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    {rental.returnType ? (
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                          rental.returnType === "emergency"
                            ? "bg-gradient-to-r from-red-100 to-red-200 text-red-800"
                            : "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                        }`}
                      >
                        {rental.returnType === "emergency" ? (
                          <>
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Khẩn cấp
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Bình thường
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic font-medium">Chưa trả</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-8 py-6 bg-gray-50/30 border-t border-gray-100 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-4 py-2 rounded-xl border border-gray-200 disabled:opacity-50 text-blue-600 hover:bg-blue-50 disabled:hover:bg-transparent transition-all shadow-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all shadow-sm ${
                  currentPage === pageNum
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center px-4 py-2 rounded-xl border border-gray-200 disabled:opacity-50 text-blue-600 hover:bg-blue-50 disabled:hover:bg-transparent transition-all shadow-sm font-medium"
            >
              Sau
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalsTable;
