// 📁 src/components/Sidebar.jsx
import {
  FaUser,
  FaBicycle,
  FaLock,
  FaChartLine,
  FaDatabase,
  FaCamera,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaChevronDown
} from "react-icons/fa";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const linkClasses = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative cursor-pointer ${
      location.pathname === path 
        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg" 
        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
    }`;

  const menuItems = [
    { path: "/dashboard", icon: FaChartLine, label: "Bảng Điều Khiển", badge: null },
    { path: "/detect-plate", icon: FaCamera, label: "Nhận Diện Biển Số", badge: "Mới" },
    { path: "/users", icon: FaUser, label: "Quản Lý Người Dùng", badge: null },
    { path: "/bikes", icon: FaBicycle, label: "Quản Lý Xe Đạp", badge: null },
    { path: "/locks", icon: FaLock, label: "Quản Lý Khóa", badge: null },
    { path: "/statics", icon: FaDatabase, label: "Quản Lý Trạm", badge: null },
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white h-screen flex flex-col shadow-xl">
      {/* Logo và Brand */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <FaBicycle className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Smart Bike
            </h1>
            <p className="text-xs text-gray-400">Management System</p>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-4 border-b border-gray-700/50">
        <div 
          className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 cursor-pointer hover:bg-gray-700/50 transition-colors"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
        >
          <div className="relative">
            <img
              src="https://i.ytimg.com/vi/SjFnVfQBCic/hqdefault.jpg"
              alt="Admin Avatar"
              className="w-10 h-10 rounded-full border-2 border-blue-400"
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Quản Trị Viên</p>
            <p className="text-xs text-gray-400">admin@smartbike.com</p>
          </div>
          <FaChevronDown className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
        </div>

        {isProfileOpen && (
          <div className="mt-2 py-2 bg-gray-800/30 rounded-lg">
            <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors">
              <FaCog className="text-xs" />
              Cài Đặt Tài Khoản
            </button>
            <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors">
              <FaBell className="text-xs" />
              Thông Báo
            </button>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
            Menu Chính
          </p>
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={linkClasses(item.path)}
            >
              <Icon className={`text-lg ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              <span className="font-medium flex-1">{item.label}</span>
              {item.badge && (
                <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Stats Mini Cards */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 p-3 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-2">
              <FaBicycle className="text-blue-400 text-sm" />
              <div>
                <p className="text-xs text-gray-400">Xe Hoạt Động</p>
                <p className="text-sm font-bold text-white">8/9</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 p-3 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2">
              <FaUser className="text-green-400 text-sm" />
              <div>
                <p className="text-xs text-gray-400">Người Dùng</p>
                <p className="text-sm font-bold text-white">24</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700/50">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-red-600/20 rounded-lg transition-all duration-200 group">
          <FaSignOutAlt className="text-lg group-hover:text-red-400" />
          <span className="font-medium">Đăng Xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
