import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [rentalList, setRentalList] = useState([]);
  const [filter, setFilter] = useState({
    returnType: "all",
    userId: "",
    bikeId: "",
    stationId: "",
    borrowed: "",
    returned: "",
  });

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // State cho theo dõi trạng thái đăng nhập
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Nếu chưa login thì chuyển về login
        navigate("/login");
      } else {
        setAuthChecked(true);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Load dữ liệu rentalList realtime từ Firebase hoàn thành chỉ khi đã xác thực
  useEffect(() => {
    if (!authChecked) return; // Chỉ chạy khi đã xác thực

    const rentalRef = ref(db, "rentalHistory");
    const unsubscribe = onValue(rentalRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setRentalList([]);
        return;
      }

      const rentals = Object.entries(data).map(([id, item]) => ({
        ...item,
        id,
      }));

      rentals.sort((a, b) => b.borrowTimestamp - a.borrowTimestamp);
      setRentalList(rentals);
    });

    return () => unsubscribe();
  }, [authChecked]);

  const formatDateToYMD = (timestamp) => {
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const filteredRentals = rentalList.filter((rental) => {
    const {
      returnType,
      userId,
      bikeId,
      stationId,
      borrowed,
      returned,
    } = filter;

    const borrowedDate = formatDateToYMD(rental.borrowTimestamp);
    const returnedDate = rental.returnTimestamp
      ? formatDateToYMD(rental.returnTimestamp)
      : "";

    return (
      (returnType === "all" || rental.returnType === returnType) &&
      rental.userId.toLowerCase().includes(userId.toLowerCase()) &&
      rental.bikeId.toLowerCase().includes(bikeId.toLowerCase()) &&
      rental.stationId.toLowerCase().includes(stationId.toLowerCase()) &&
      (!borrowed || borrowedDate === borrowed) &&
      (!returned || returnedDate === returned)
    );
  });

  const totalPages = Math.ceil(filteredRentals.length / itemsPerPage);

  const currentRentals = filteredRentals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset trang khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Nếu chưa check xong auth thì có thể hiện loading hoặc khoảng trống để tránh flash nội dung
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Đang kiểm tra đăng nhập...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Lịch Sử Thuê Xe</h1>
            <p className="text-gray-600 text-sm mt-1">Quản lý lịch sử thuê xe đạp thông minh</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {filteredRentals.length} results
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        {/* Bộ lọc tìm kiếm */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
              <h3 className="text-lg font-semibold text-gray-800">Bộ lọc tìm kiếm</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Các input, select như trước */}
            {/* ... giữ nguyên như bạn đang dùng */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Loại Trả Xe</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white"
                value={filter.returnType}
                onChange={(e) => setFilter({ ...filter, returnType: e.target.value })}
              >
                <option value="all">Tất cả</option>
                <option value="normal">Bình thường</option>
                <option value="emergency">Khẩn cấp</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Mã Người Dùng</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                placeholder="Nhập ID"
                value={filter.userId}
                onChange={(e) => setFilter({ ...filter, userId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Mã Xe Đạp</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white"
                value={filter.bikeId}
                onChange={(e) => setFilter({ ...filter, bikeId: e.target.value })}
              >
                <option value="">Tất cả</option>
                {Array.from({ length: 9 }, (_, i) => `bike${i + 1}`).map((bike) => (
                  <option key={bike} value={bike}>
                    {bike}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Trạm</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white"
                value={filter.stationId}
                onChange={(e) => setFilter({ ...filter, stationId: e.target.value })}
              >
                <option value="">Tất cả</option>
                <option value="station1">station1</option>
                <option value="station2">station2</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Ngày Thuê</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                value={filter.borrowed}
                onChange={(e) => setFilter({ ...filter, borrowed: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Ngày Trả</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                value={filter.returned}
                onChange={(e) => setFilter({ ...filter, returned: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Bảng dữ liệu với phân trang */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Dữ liệu thuê xe</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Tổng cộng: {filteredRentals.length} bản ghi
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã Người Dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã Xe Đạp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày Thuê
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày Trả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời Gian (giây)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại Trả Xe
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRentals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      Không tìm thấy dữ liệu phù hợp
                    </td>
                  </tr>
                ) : (
                  currentRentals.map((rental, index) => (
                    <tr
                      key={rental.id}
                      className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                          <span className="font-medium">{rental.userId?.slice(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-800">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {rental.bikeId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-800">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {rental.stationId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="text-sm">
                          <div className="font-medium">{new Date(rental.borrowTimestamp).toLocaleDateString()}</div>
                          <div className="text-gray-500">{new Date(rental.borrowTimestamp).toLocaleTimeString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rental.returnTimestamp ? (
                          <div className="text-sm">
                            <div className="font-medium">{new Date(rental.returnTimestamp).toLocaleDateString()}</div>
                            <div className="text-gray-500">{new Date(rental.returnTimestamp).toLocaleTimeString()}</div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Processing
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {Math.floor(rental.duration / 1000)}s
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rental.returnType ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              rental.returnType === "emergency"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {rental.returnType === "emergency" ? "🚨 Khẩn cấp" : "✅ Bình thường"}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">-</span>
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
            <div className="px-6 py-3 border-t border-gray-200 flex justify-center space-x-3">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 text-blue-600 hover:bg-blue-100"
              >
                {"<"} Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-1 rounded border ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 text-blue-600 hover:bg-blue-100"
              >
                Next {">"}
              </button>
            </div>
          )}
        </div>

        {/* Thông báo khi không có dữ liệu */}
        {filteredRentals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy dữ liệu</h3>
            <p className="text-gray-500">
              Không có lịch sử thuê xe nào phù hợp với tiêu chí tìm kiếm của bạn.
            </p>
          </div>
        )}

        {/* Footer stats */}
        {filteredRentals.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Hiển thị {filteredRentals.length} kết quả</span>
              <span>Cập nhật lần cuối: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
