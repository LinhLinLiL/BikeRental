import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

export default function StationDetail({ stations }) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Chi Tiết Từng Trạm</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{stations.length} trạm hoạt động</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stations.map((station) => {
          const totalActivity = station.rentals + station.returns + station.emergencyReturns;
          const efficiency = station.rentals > 0 ? ((station.returns / station.rentals) * 100).toFixed(1) : 0;

          // Tạo dataset riêng cho biểu đồ cột của trạm này, 3 cột rõ ràng
          const chartData = [
            { name: "Thuê xe", value: station.rentals, color: "#3b82f6" },
            { name: "Trả xe", value: station.returns, color: "#10b981" },
            { name: "Khẩn cấp", value: station.emergencyReturns, color: "#ef4444" },
          ];

          return (
            <article
              key={station.stationId}
              className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300"
            >
              {/* Header trạm */}
              <header className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-800">{station.stationId}</h4>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Hoạt động</span>
                </div>
              </header>

              {/* Hiển thị chỉ số 3 cột */}
              <div className="grid grid-cols-3 gap-6 text-center mb-6">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{station.rentals}</p>
                  <p className="text-xs text-gray-500">Thuê xe</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{station.returns}</p>
                  <p className="text-xs text-gray-500">Trả xe</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{station.emergencyReturns}</p>
                  <p className="text-xs text-gray-500">Khẩn cấp</p>
                </div>
              </div>

              {/* Hiệu suất */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Hiệu suất</span>
                  <span className="text-sm font-semibold text-gray-800">{efficiency}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(efficiency, 100)}%` }}
                  />
                </div>
              </div>

              {/* Biểu đồ cột riêng cho trạm */}
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: 14 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={1000} isAnimationActive>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Footer */}
              <footer className="mt-6 pt-6 border-t border-gray-200 flex justify-between text-sm text-gray-600">
                <span>
                  Tổng hoạt động: <strong>{totalActivity}</strong>
                </span>
                <span>Cập nhật: {new Date().toLocaleTimeString()}</span>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}
