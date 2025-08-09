import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line no-unused-vars
// import { Users, Clock, AlertTriangle, CheckCircle, Bike, MapPin, Filter } from "lucide-react";

import StatCard from "./StatCard";
import FilterPanel from "./FilterPanel";
import RentalsTable from "./RentalsTable";
import StatsList from "./StatsList";
import MonthlyRentalsStats from "./MonthlyRentalStats";
import LoadingScreen from "./LoadingScreen";

import useAuthCheck from "./hooks/useAuthCheck";
import useBikeList from "./hooks/useBikeList";
import useRentalData from "./hooks/useRentalData";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Hook kiểm tra đăng nhập (điều hướng nếu chưa login)
  const authChecked = useAuthCheck(navigate);

  // Hook lấy danh sách xe đạp
  const bikeList = useBikeList();

  // Quản lý state filter
  const [filter, setFilter] = useState({
    returnType: "all",
    userId: "",
    bikeId: "",
    stationId: "",
    borrowed: "",
    returned: "",
  });

  // Hook lấy dữ liệu thuê xe, trả về các trạng thái và data follower filter
  const {
    // rentalList,
    filteredRentals,
    stats,
    rentalsPerMonth,
    isLoading,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useRentalData(authChecked, filter);

  // Chuyển trang
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Tự reset trang khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, setCurrentPage]);

  if (!authChecked || isLoading) return <LoadingScreen checking={authChecked} />;

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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Tổng Lượt Thuê" value={stats.totalRentals} icon="Users" color="blue" />
          <StatCard title="Thời Gian TB" value={`${Math.round(stats.averageDuration / 1000)}s`} icon="Clock" color="green" />
          <StatCard title="Trả Khẩn Cấp" value={stats.emergencyReturns} icon="AlertTriangle" color="red" />
          <StatCard title="Trả Bình Thường" value={stats.normalReturns} icon="CheckCircle" color="purple" />
        </div>

        {/* Filter */}
        <FilterPanel filter={filter} setFilter={setFilter} bikeList={bikeList} />

        {/* Rentals Table */}
        <RentalsTable
          rentals={filteredRentals.slice((currentPage - 1) * 15, currentPage * 15)}
          currentPage={currentPage}
          totalPages={totalPages}
          goToPage={goToPage}
          totalRecords={filteredRentals.length}
        />

        {/* Other Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <StatsList title="Thống Kê Người Dùng" data={stats.rentalsPerUser} icon="Users" color="blue" />
          <StatsList title="Thống Kê Xe Đạp" data={stats.rentalsPerBike} icon="Bike" color="green" />
          <StatsList title="Thống Kê Trạm" data={stats.rentalsPerStation} icon="MapPin" color="purple" />
        </div>

        {/* Monthly Rentals Stats */}
        <MonthlyRentalsStats rentalsPerMonth={rentalsPerMonth} />

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
