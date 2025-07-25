import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StationStats() {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    const statisticsRef = ref(db, "statistics");
    onValue(statisticsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data).map((item) => ({
          stationId: item.stationId || "Unknown",
          rentals: item.rentals || 0,
          returns: item.returns || 0,
          emergencyReturns: item.emergencyReturns || 0,
        }));
        setStations(list);
      }
    });
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-6">Station Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stations.map((station) => {
          const chartData = [
            { name: "Rentals", value: station.rentals, color: "#3b82f6" },
            { name: "Returns", value: station.returns, color: "#10b981" },
            { name: "Emergency", value: station.emergencyReturns, color: "#ef4444" },
          ];

          return (
            <div key={station.stationId} className="bg-blue-50 p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-2">{station.stationId}</h3>
              <p>
                Rentals: <span className="font-bold text-blue-700">{station.rentals}</span>
              </p>
              <p>
                Returns: <span className="font-bold text-green-700">{station.returns}</span>
              </p>
              <p>
                Emergency Returns:{" "}
                <span className="font-bold text-red-600">{station.emergencyReturns}</span>
              </p>

              {/* Biểu đồ cột nhỏ */}
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      fill="#8884d8"
                      label={{ position: "top" }}
                      isAnimationActive={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
