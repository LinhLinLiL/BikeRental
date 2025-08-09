import { Users, Bike, MapPin } from "lucide-react";

const icons = {
  Users,
  Bike,
  MapPin,
};

const gradientBg = {
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  purple: "bg-purple-100 text-purple-800",
};

const StatsList = ({ title, data, icon, color }) => {
  const Icon = icons[icon];
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div className={`px-6 py-4 bg-gradient-to-r from-${color}-50 to-${color}-100 border-b border-gray-100`}>
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <Icon className={`w-5 h-5 mr-2 text-${color}-600`} />
          {title}
        </h3>
      </div>
      <div className="p-6 max-h-80 overflow-y-auto">
        <div className="space-y-3">
          {Object.entries(data).map(([key, count]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium text-gray-700">
                {key.length > 8 ? `${key.slice(0, 8)}...` : key}
              </span>
              <span className={`${gradientBg[color]} px-3 py-1 rounded-full text-sm font-bold`}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsList;
