import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

export default function StationChart({ stations }) {
  const totalRentals = stations.reduce((sum, s) => sum + s.rentals, 0);
  const totalReturns = stations.reduce((sum, s) => sum + s.returns, 0);
  const totalEmergencies = stations.reduce((sum, s) => sum + s.emergencyReturns, 0);

  const pieData = [
    { name: "Thuê xe", value: totalRentals, fill: "#2563eb" },       // blue-600
    { name: "Trả xe", value: totalReturns, fill: "#16a34a" },       // green-600
    { name: "Khẩn cấp", value: totalEmergencies, fill: "#dc2626" }, // red-600
  ];

  const areaChartData = stations;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* PieChart Tổng quan */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Tổng Quan Hệ Thống</h3>
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#2563eb" }}></span>
              <span>Thuê xe</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#16a34a" }}></span>
              <span>Trả xe</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#dc2626" }}></span>
              <span>Khẩn cấp</span>
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={110}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              animationDuration={1000}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </section>

      {/* AreaChart phân phối từng trạm */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Phân phối Theo Từng Trạm</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={areaChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRentals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEmergencies" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="stationId" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: 14 }}
            />
            <Area
              type="monotone"
              dataKey="rentals"
              stackId="1"
              stroke="#2563eb"
              fill="url(#colorRentals)"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="returns"
              stackId="1"
              stroke="#16a34a"
              fill="url(#colorReturns)"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="emergencyReturns"
              stackId="1"
              stroke="#dc2626"
              fill="url(#colorEmergencies)"
              fillOpacity={0.9}
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
