// import React, { useEffect, useState } from "react";
// import { ref, onValue } from "firebase/database";
// import { db } from "../firebase";
// import {
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Tooltip,
//   Legend,
//   AreaChart,
//   Area,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   BarChart,
//   Bar,
//   Cell,
// } from "recharts";

// export default function StationStats() {
//   const [stations, setStations] = useState([]);

//   // Lấy data realtime từ Firebase
//   useEffect(() => {
//     const statisticsRef = ref(db, "statistics");
//     const unsubscribe = onValue(statisticsRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const list = Object.values(data).map((item) => ({
//           stationId: item.stationId || "Unknown",
//           rentals: item.rentals || 0,
//           returns: item.returns || 0,
//           emergencyReturns: item.emergencyReturns || 0,
//         }));
//         setStations(list);
//       } else {
//         setStations([]);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   // Tổng số liệu
//   const totalRentals = stations.reduce((sum, s) => sum + s.rentals, 0);
//   const totalReturns = stations.reduce((sum, s) => sum + s.returns, 0);
//   const totalEmergencies = stations.reduce((sum, s) => sum + s.emergencyReturns, 0);
//   const utilizationRate =
//     totalRentals + totalReturns > 0
//       ? ((totalReturns / (totalRentals + totalReturns)) * 100).toFixed(1)
//       : 0;

//   // Card thống kê tổng quan (bỏ trend)
//   const StatCard = ({ title, value, subtitle, icon, color }) => (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
//           <p className={`text-3xl font-bold ${color}`}>{value}</p>
//           {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
//         </div>
//         <div className={`text-4xl ${color} opacity-70`}>{icon}</div>
//       </div>
//     </div>
//   );

//   // Dữ liệu cho pie chart tổng quan
//   const pieData = [
//     { name: "Thuê xe", value: totalRentals, fill: "#3b82f6" },
//     { name: "Trả xe", value: totalReturns, fill: "#10b981" },
//     { name: "Khẩn cấp", value: totalEmergencies, fill: "#ef4444" },
//   ];

//   // Dữ liệu cho biểu đồ xu hướng (hiện dùng stations snapshot, không thực sự là xu hướng theo thời gian)
//   const areaChartData = stations;

//   // Dữ liệu cho biểu đồ cột từng trạm
//   const chartData = stations.map((station) => ({
//     name: station.stationId,
//     value: station.rentals + station.returns + station.emergencyReturns,
//     rentals: station.rentals,
//     returns: station.returns,
//     emergencyReturns: station.emergencyReturns,
//     color: "#3b82f6", // có thể customize theo từng loại tùy bạn
//   }));

//   // Tổng hoạt động cho footer
//   // const totalActivity = chartData.reduce((acc, cur) => acc + cur.value, 0);

//   if (stations.length === 0) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center p-8 text-gray-700">
//         <span className="text-6xl mb-4">🏪</span>
//         <h2 className="text-2xl font-semibold mb-2">Chưa có dữ liệu trạm</h2>
//         <p>Hệ thống đang tải dữ liệu từ các trạm xe đạp...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 max-w-7xl mx-auto">
//       {/* Header */}
//       <header className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-800 mb-2">Thống Kê Trạm Xe Đạp</h1>
//         <p className="text-gray-600">Phân tích hiệu suất và sử dụng các trạm xe đạp thông minh</p>
//       </header>

//       {/* Cards tổng quan */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <StatCard
//           title="Tổng Số Thuê"
//           value={totalRentals}
//           icon="🚴‍♂️"
//           color="text-blue-600"
//           subtitle="Tất cả trạm"
//         />
//         <StatCard
//           title="Tổng Số Trả"
//           value={totalReturns}
//           icon="🔄"
//           color="text-green-600"
//           subtitle="Hoàn thành"
//         />
//         <StatCard
//           title="Trả Khẩn Cấp"
//           value={totalEmergencies}
//           icon="🚨"
//           color="text-red-600"
//           subtitle="Cần xử lý"
//         />
//         <StatCard
//           title="Tỷ Lệ Sử Dụng"
//           value={`${utilizationRate}%`}
//           icon="📊"
//           color="text-purple-600"
//           subtitle="Hiệu suất trung bình"
//         />
//       </div>

//       {/* Biểu đồ tổng quan PieChart */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-lg font-semibold text-gray-800">Tổng Quan Hệ Thống</h3>
//             <div className="flex items-center space-x-2">
//               <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
//               <span className="text-sm text-gray-600">Thuê xe</span>
//               <div className="w-3 h-3 bg-green-500 rounded-full ml-3"></div>
//               <span className="text-sm text-gray-600">Trả xe</span>
//               <div className="w-3 h-3 bg-red-500 rounded-full ml-3"></div>
//               <span className="text-sm text-gray-600">Khẩn cấp</span>
//             </div>
//           </div>
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={pieData}
//                 cx="50%"
//                 cy="50%"
//                 innerRadius={60}
//                 outerRadius={120}
//                 paddingAngle={5}
//                 dataKey="value"
//                 nameKey="name"
//               />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "white",
//                   border: "1px solid #e5e7eb",
//                   borderRadius: "8px",
//                 }}
//               />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>
//         </section>

//         {/* Biểu đồ xu hướng hiện tại với data phân phối trạm (không phải thời gian thực) */}
//         <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//           <h3 className="text-lg font-semibold text-gray-800 mb-6">Phân phối theo từng trạm</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <AreaChart data={areaChartData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis dataKey="stationId" tick={{ fontSize: 12 }} />
//               <YAxis tick={{ fontSize: 12 }} />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "white",
//                   border: "1px solid #e5e7eb",
//                   borderRadius: "8px",
//                   fontSize: 14,
//                 }}
//               />
//               <Area
//                 type="monotone"
//                 dataKey="rentals"
//                 stackId="1"
//                 stroke="#3b82f6"
//                 fill="#3b82f6"
//                 fillOpacity={0.6}
//               />
//               <Area
//                 type="monotone"
//                 dataKey="returns"
//                 stackId="1"
//                 stroke="#10b981"
//                 fill="#10b981"
//                 fillOpacity={0.6}
//               />
//               <Area
//                 type="monotone"
//                 dataKey="emergencyReturns"
//                 stackId="1"
//                 stroke="#ef4444"
//                 fill="#ef4444"
//                 fillOpacity={0.6}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </section>
//       </div>

//       {/* Chi tiết từng trạm */}
//       <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-semibold text-gray-800">Chi Tiết Từng Trạm</h3>
//           <div className="flex items-center space-x-2">
//             <span className="text-sm text-gray-500">{stations.length} trạm hoạt động</span>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {stations.map((station) => {
//             // const chartData = [
//             //   { name: "Thuê", value: station.rentals, color: "#3b82f6" },
//             //   { name: "Trả", value: station.returns, color: "#10b981" },
//             //   { name: "Khẩn cấp", value: station.emergencyReturns, color: "#ef4444" },
//             // ];

//             const totalActivity =
//               station.rentals + station.returns + station.emergencyReturns;

//             const efficiency =
//               station.rentals > 0
//                 ? ((station.returns / station.rentals) * 100).toFixed(1)
//                 : 0;

//             return (
//               <article
//                 key={station.stationId}
//                 className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300"
//               >
//                 {/* Header trạm */}
//                 <header className="flex items-center justify-between mb-4">
//                   <h4 className="text-lg font-bold text-gray-800">{station.stationId}</h4>
//                   <div className="flex items-center space-x-2">
//                     <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
//                     <span className="text-xs text-gray-500">Hoạt động</span>
//                   </div>
//                 </header>

//                 {/* Chỉ số nhanh */}
//                 <div className="grid grid-cols-3 gap-4 mb-6 text-center">
//                   <div>
//                     <p className="text-2xl font-bold text-blue-600">{station.rentals}</p>
//                     <p className="text-xs text-gray-500">Thuê xe</p>
//                   </div>
//                   <div>
//                     <p className="text-2xl font-bold text-green-600">{station.returns}</p>
//                     <p className="text-xs text-gray-500">Trả xe</p>
//                   </div>
//                   <div>
//                     <p className="text-2xl font-bold text-red-600">{station.emergencyReturns}</p>
//                     <p className="text-xs text-gray-500">Khẩn cấp</p>
//                   </div>
//                 </div>

//                 {/* Hiệu suất */}
//                 <div className="mb-4">
//                   <div className="flex justify-between items-center mb-2">
//                     <span className="text-sm text-gray-600">Hiệu suất</span>
//                     <span className="text-sm font-semibold text-gray-800">{efficiency}%</span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div
//                       className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
//                       style={{ width: `${Math.min(efficiency, 100)}%` }}
//                     ></div>
//                   </div>
//                 </div>

//                 {/* Biểu đồ cột */}
//                 <div className="mt-6">
//                   <ResponsiveContainer width="100%" height={200}>
//                     <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                       <XAxis
//                         dataKey="name"
//                         tick={{ fontSize: 12 }}
//                         axisLine={false}
//                         tickLine={false}
//                       />
//                       <YAxis
//                         allowDecimals={false}
//                         tick={{ fontSize: 12 }}
//                         axisLine={false}
//                         tickLine={false}
//                       />
//                       <Tooltip
//                         contentStyle={{
//                           backgroundColor: "white",
//                           border: "1px solid #e5e7eb",
//                           borderRadius: "8px",
//                           fontSize: 14,
//                         }}
//                       />
//                       <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1000}>
//                         {chartData.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={entry.color} />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>

//                 {/* Footer */}
//                 <footer className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-600">
//                   <span>
//                     Tổng hoạt động: <strong>{totalActivity}</strong>
//                   </span>
//                   <span>Cập nhật: {new Date().toLocaleTimeString()}</span>
//                 </footer>
//               </article>
//             );
//           })}
//         </div>
//       </section>
//     </div>
//   );
// }
