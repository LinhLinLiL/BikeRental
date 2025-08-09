import React from "react";
import useStationStats from "./hooks/useStationStats";
import StatCard from "./StatCard";
import StationChart from "./StationChart";
import StationDetail from "./StationDetail";

export default function StationStats() {
  const { stations, totalRentals, totalReturns, totalEmergencies, utilizationRate } = useStationStats();

  if (stations.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-gray-700">
        <span className="text-6xl mb-4">🏪</span>
        <h2 className="text-2xl font-semibold mb-2">Chưa có dữ liệu trạm</h2>
        <p>Hệ thống đang tải dữ liệu từ các trạm xe đạp...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Thống Kê Trạm Xe Đạp</h1>
        <p className="text-gray-600">Phân tích hiệu suất và sử dụng các trạm xe đạp thông minh</p>
      </header>

      {/* Cards thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Tổng Số Thuê" value={totalRentals} icon="🚴‍♂️" color="text-blue-600" subtitle="Tất cả trạm" />
        <StatCard title="Tổng Số Trả" value={totalReturns} icon="🔄" color="text-green-600" subtitle="Hoàn thành" />
        <StatCard title="Trả Khẩn Cấp" value={totalEmergencies} icon="🚨" color="text-red-600" subtitle="Cần xử lý" />
        <StatCard title="Tỷ Lệ Sử Dụng" value={`${utilizationRate}%`} icon="📊" color="text-purple-600" subtitle="Hiệu suất trung bình" />
      </div>

      {/* Biểu đồ tổng quan và phân phối */}
      <StationChart stations={stations} />

      {/* Chi tiết từng trạm */}
      <StationDetail stations={stations} />
    </div>
  );
}
