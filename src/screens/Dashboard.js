import React, { useEffect, useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Users,
  Bike,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  // TrendingUp,
} from "lucide-react";

import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [rentalList, setRentalList] = useState([]);
  const [bikeList, setBikeList] = useState([]); // Dynamic bike list from database
  const [filter, setFilter] = useState({
    returnType: "all",
    userId: "",
    bikeId: "",
    stationId: "",
    borrowed: "",
    returned: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [authChecked, setAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setAuthChecked(true);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Load bike list from Firebase Realtime Database (assumes node "bikes")
  useEffect(() => {
    const bikeRef = ref(db, "bikes");
    const unsubscribe = onValue(bikeRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setBikeList([]);
        return;
      }
      // Extract bike IDs from keys
      const bikes = Object.keys(data);
      setBikeList(bikes);
    });

    return () => unsubscribe();
  }, []);

  // Load rental history list realtime, only after auth checked
  useEffect(() => {
    if (!authChecked) return;

    setIsLoading(true);
    const rentalRef = ref(db, "rentalHistory");
    const unsubscribe = onValue(
      rentalRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setRentalList([]);
          setIsLoading(false);
          return;
        }

        const rentals = Object.entries(data).map(([id, item]) => ({
          ...item,
          id,
        }));

        // Sort by most recent borrowTimestamp
        rentals.sort((a, b) => b.borrowTimestamp - a.borrowTimestamp);

        setRentalList(rentals);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error loading rentalHistory:", error);
        setRentalList([]);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authChecked]);

  // Helper to format timestamps to YYYY-MM-DD string
  const formatDateToYMD = (timestamp) => {
    if (!timestamp) return "";
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Filter rental records based on filter state
  const filteredRentals = useMemo(() => {
    return rentalList.filter((rental) => {
      const { returnType, userId, bikeId, stationId, borrowed, returned } =
        filter;

      const borrowedDate = formatDateToYMD(rental.borrowTimestamp);
      const returnedDate = rental.returnTimestamp
        ? formatDateToYMD(rental.returnTimestamp)
        : "";

      return (
        (returnType === "all" || rental.returnType === returnType) &&
        (!userId || (rental.userId || "").toLowerCase().includes(userId.toLowerCase())) &&
        (!bikeId || (rental.bikeId || "").toLowerCase().includes(bikeId.toLowerCase())) &&
        (!stationId || (rental.stationId || "").toLowerCase().includes(stationId.toLowerCase())) &&
        (!borrowed || borrowedDate === borrowed) &&
        (!returned || returnedDate === returned)
      );
    });
  }, [rentalList, filter]);

  // Compute statistics from filtered list
  const stats = useMemo(() => {
    const totalRentals = filteredRentals.length;
    const completedRentals = filteredRentals.filter(
      (rental) => rental.returnTimestamp
    );
    const totalDuration = completedRentals.reduce(
      (sum, rental) => sum + (rental.duration || 0),
      0
    );
    const averageDuration =
      completedRentals.length > 0 ? totalDuration / completedRentals.length : 0;
    const emergencyReturns = filteredRentals.filter(
      (rental) => rental.returnType === "emergency"
    ).length;
    const normalReturns = filteredRentals.filter(
      (rental) => rental.returnType === "normal"
    ).length;
    const rentalsPerUser = filteredRentals.reduce((acc, rental) => {
      if (rental.userId) {
        acc[rental.userId] = (acc[rental.userId] || 0) + 1;
      }
      return acc;
    }, {});
    const rentalsPerBike = filteredRentals.reduce((acc, rental) => {
      if (rental.bikeId) {
        acc[rental.bikeId] = (acc[rental.bikeId] || 0) + 1;
      }
      return acc;
    }, {});
    const rentalsPerStation = filteredRentals.reduce((acc, rental) => {
      if (rental.stationId) {
        acc[rental.stationId] = (acc[rental.stationId] || 0) + 1;
      }
      return acc;
    }, {});
    return {
      totalRentals,
      averageDuration,
      emergencyReturns,
      normalReturns,
      rentalsPerUser,
      rentalsPerBike,
      rentalsPerStation,
    };
  }, [filteredRentals]);

  const totalPages = Math.ceil(filteredRentals.length / itemsPerPage);
  const currentRentals = filteredRentals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            {authChecked ? "Đang tải dữ liệu..." : "Đang kiểm tra đăng nhập..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Lịch Sử Thuê Xe
              </h1>
              <p className="text-gray-600 mt-2 font-medium">
                Quản lý lịch sử thuê xe đạp thông minh
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg font-semibold">
                {stats.totalRentals} kết quả
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                  Tổng Lượt Thuê
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats.totalRentals}
                </p>
                {/* <div className="flex items-center mt-2 text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">+12%</span>
                </div> */}
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                  Thời Gian TB
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {Math.round(stats.averageDuration / 1000)}s
                </p>
                {/* <div className="flex items-center mt-2 text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Ổn định</span>
                </div> */}
              </div>
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-xl shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                  Trả Khẩn Cấp
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats.emergencyReturns}
                </p>
                <div className="flex items-center mt-2 text-red-600">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Cần chú ý</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-400 to-red-600 p-4 rounded-xl shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                  Trả Bình Thường
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats.normalReturns}
                </p>
                <div className="flex items-center mt-2 text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Tốt</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-4 rounded-xl shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center">
              <Filter className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">Bộ lọc tìm kiếm</h3>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Loại Trả Xe
                </label>
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm shadow-sm"
                  value={filter.returnType}
                  onChange={(e) =>
                    setFilter({ ...filter, returnType: e.target.value })
                  }
                >
                  <option value="all">Tất cả</option>
                  <option value="normal">Bình thường</option>
                  <option value="emergency">Khẩn cấp</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Mã Người Dùng
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm shadow-sm"
                    placeholder="Nhập ID"
                    value={filter.userId}
                    onChange={(e) =>
                      setFilter({ ...filter, userId: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Bike ID filter (from Firebase) */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Mã Xe Đạp
                </label>
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

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Trạm
                </label>
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm shadow-sm"
                  value={filter.stationId}
                  onChange={(e) =>
                    setFilter({ ...filter, stationId: e.target.value })
                  }
                >
                  <option value="">Tất cả</option>
                  <option value="station1">station1</option>
                  <option value="station2">station2</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Ngày Thuê
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm shadow-sm"
                    value={filter.borrowed}
                    onChange={(e) =>
                      setFilter({ ...filter, borrowed: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Ngày Trả
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm shadow-sm"
                    value={filter.returned}
                    onChange={(e) =>
                      setFilter({ ...filter, returned: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Data Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Dữ liệu thuê xe</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
                  Tổng cộng: <span className="font-bold">{filteredRentals.length}</span> bản ghi
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Người Dùng
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Xe Đạp
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Trạm
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Ngày Thuê
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Ngày Trả
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Thời Gian
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Trạng Thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentRentals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <div className="text-gray-400 text-6xl mb-6">📊</div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Không tìm thấy dữ liệu
                      </h3>
                      <p className="text-gray-500">
                        Không có lịch sử thuê xe nào phù hợp với tiêu chí tìm kiếm.
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentRentals.map((rental) => (
                    <tr
                      key={rental.id}
                      className="hover:bg-blue-50/30 transition-all duration-200 group"
                    >
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mr-4 shadow-sm"></div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {rental.userId?.slice(0, 8)}...
                            </div>
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
                          <span className="text-gray-400 italic font-medium">
                            Chưa trả
                          </span>
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

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
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
                  )
                )}

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

        {/* Statistics Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Thống Kê Người Dùng
              </h3>
            </div>
            <div className="p-6 max-h-80 overflow-y-auto">
              <div className="space-y-3">
                {Object.entries(stats.rentalsPerUser).map(([userId, count]) => (
                  <div
                    key={userId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {userId.slice(0, 8)}...
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <Bike className="w-5 h-5 mr-2 text-green-600" />
                Thống Kê Xe Đạp
              </h3>
            </div>
            <div className="p-6 max-h-80 overflow-y-auto">
              <div className="space-y-3">
                {Object.entries(stats.rentalsPerBike).map(([bikeId, count]) => (
                  <div
                    key={bikeId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <span className="text-sm font-medium text-gray-700">{bikeId}</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                Thống Kê Trạm
              </h3>
            </div>
            <div className="p-6 max-h-80 overflow-y-auto">
              <div className="space-y-3">
                {Object.entries(stats.rentalsPerStation).map(
                  ([stationId, count]) => (
                    <div
                      key={stationId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {stationId}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">
                        {count}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        {filteredRentals.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 px-8 py-6">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                <span className="text-gray-600">
                  Hiển thị{" "}
                  <span className="font-bold text-gray-800">{filteredRentals.length}</span>{" "}
                  kết quả
                </span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Dữ liệu được cập nhật realtime</span>
              </div>
              <span className="text-gray-600">
                Cập nhật lần cuối:{" "}
                <span className="font-semibold">{new Date().toLocaleTimeString()}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
