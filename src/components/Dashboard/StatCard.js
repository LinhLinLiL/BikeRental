import { Users, Clock, AlertTriangle, CheckCircle, Bike, MapPin } from "lucide-react";

const icons = {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Bike,
  MapPin,
};

const gradientFrom = {
  blue: "from-blue-400",
  green: "from-green-400",
  red: "from-red-400",
  purple: "from-purple-400",
};

const gradientTo = {
  blue: "to-blue-600",
  green: "to-green-600",
  red: "to-red-600",
  purple: "to-purple-600",
};

const StatCard = ({ title, value, icon, color }) => {
  const Icon = icons[icon];
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className={`bg-gradient-to-br ${gradientFrom[color]} ${gradientTo[color]} p-4 rounded-xl shadow-lg`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
