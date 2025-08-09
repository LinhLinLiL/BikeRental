import { Clock } from "lucide-react";

const MonthlyRentalsStats = ({ rentalsPerMonth }) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden max-w-3xl mx-auto mt-8">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          Tổng Lượt Thuê Theo Tháng
        </h3>
      </div>
      <div className="p-6 max-h-80 overflow-y-auto">
        {Object.keys(rentalsPerMonth.counts).length === 0 ? (
          <p className="text-gray-600">Không có dữ liệu thống kê theo tháng</p>
        ) : (
          <div className="space-y-3">
            {Object.keys(rentalsPerMonth.counts)
              .sort((a, b) => b.localeCompare(a)) // tháng mới nhất lên trên
              .map((month) => {
                const count = rentalsPerMonth.counts[month];
                const diff = rentalsPerMonth.diffs[month];
                const isIncrease = diff > 0;
                return (
                  <div
                    key={month}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <span className="font-mono text-sm text-gray-700">{month}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{count} lượt thuê</span>
                      {diff !== 0 && (
                        <span
                          className={`text-sm font-bold ${
                            isIncrease ? "text-green-600" : "text-red-600"
                          } flex items-center`}
                          title={isIncrease ? "Tăng so với tháng trước" : "Giảm so với tháng trước"}
                        >
                          {isIncrease ? "🔺" : "🔻"} {Math.abs(diff)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyRentalsStats;
