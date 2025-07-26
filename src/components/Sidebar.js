import {
  FaUser,
  FaBicycle,
  FaCamera,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaChevronDown,
  FaTachometerAlt,
  FaUsers,
  FaKey,
  FaServer,
} from "react-icons/fa";

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Thêm state cho nhóm menu mở rộng / thu gọn
  const [openGroups, setOpenGroups] = useState({
    main: true,
    management: true,
  });

  const handleToggleGroup = (groupKey) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Lớp CSS cho menu item
  const linkClasses = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative cursor-pointer mb-1 ${
      location.pathname === path
        ? "bg-white text-blue-700 shadow-md font-semibold"
        : "bg-white text-blue-800 hover:bg-blue-100 hover:text-blue-900 hover:shadow"
    }`;

  const menuItems = [
    { path: "/dashboard", icon: FaTachometerAlt, label: "Dashboard", category: "main" },
    { path: "/detect-plate", icon: FaCamera, label: "Nhận Diện Biển Số", badge: "New", category: "main" },
    { path: "/users", icon: FaUsers, label: "Quản Lý Người Dùng", category: "management" },
    { path: "/bikes", icon: FaBicycle, label: "Quản Lý Xe Đạp", category: "management" },
    { path: "/locks", icon: FaKey, label: "Quản Lý Khóa", category: "management" },
    { path: "/statics", icon: FaServer, label: "Quản Lý Trạm", category: "management" },
  ];

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const categoryLabels = {
    main: "Tổng Quan",
    management: "Quản Lý",
  };

  return (
    <div
      className={`${isCollapsed ? "w-20" : "w-72"} bg-gradient-to-br from-[#d0e2ff] to-[#73a5ff] text-blue-900 h-screen flex flex-col shadow-2xl relative transition-all duration-300 border-r border-blue-400/40`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors z-10"
        aria-label="Toggle sidebar"
      >
        <FaChevronDown
          className={`text-xs transition-transform ${isCollapsed ? "rotate-90" : "-rotate-90"}`}
        />
      </button>

      {/* Logo và Brand */}
      <div className="p-6 border-b border-blue-400/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FaBicycle className="text-white text-xl" />
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-300">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 bg-clip-text text-transparent">
                SmartBike
              </h1>
              <p className="text-sm text-blue-900 font-medium">Management Hub</p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Section */}
      {!isCollapsed && (
        <div className="p-4 border-b border-blue-400/30">
          {/* Bọc toàn bộ phần profile trong box trắng bo góc */}
          <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-200">
            {/* Phần chính profile (avatar, tên, email, mũi tên) */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              aria-label="Toggle profile menu"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvXplwiUHPXiBYbk50ropUujrvVUa4GN0Vbw&s"
                    alt="Admin Avatar"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-200 shadow-sm"></div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-blue-900">Quản Trị Viên</p>
                <p className="text-sm text-blue-700">admin@smartbike.com</p>
              </div>
              <FaChevronDown
                className={`text-blue-700 transition-transform duration-300 ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* Phần dropdown nội dung khi mở */}
            {isProfileOpen && (
              <div className="mt-3 py-2 rounded-xl border border-gray-200 bg-white shadow-sm animate-in slide-in-from-top-2 duration-200">
                <button className="flex items-center gap-3 w-full px-4 py-3 text-sm text-blue-800 hover:text-blue-900 hover:bg-blue-100 transition-all duration-200 rounded-lg mb-2">
                  <FaCog className="text-blue-600" />
                  Cài Đặt Tài Khoản
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-3 text-sm text-blue-800 hover:text-blue-900 hover:bg-blue-100 transition-all duration-200 rounded-lg">
                  <FaBell className="text-yellow-400" />
                  Thông Báo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto" aria-label="Sidebar navigation">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category}>
            {!isCollapsed && (
              <div className="mb-2 flex items-center justify-between cursor-pointer select-none"
                   onClick={() => handleToggleGroup(category)}
                   aria-expanded={openGroups[category]}
                   aria-controls={`${category}-menu`}
                   role="button"
                   tabIndex={0}
                   onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') handleToggleGroup(category)}}
              >
                <p className="text-xs font-bold text-blue-700/80 uppercase tracking-wider px-2">
                  {categoryLabels[category]}
                </p>
                <FaChevronDown
                  className={`text-blue-700 transition-transform duration-300 mr-2 ${openGroups[category] ? "rotate-0" : "-rotate-90"}`}
                  aria-hidden="true"
                />
              </div>
            )}

            {/* Thu gọn nhóm nếu isCollapsed false */}
            {(!isCollapsed && openGroups[category]) && (
              <div id={`${category}-menu`} className="space-y-1" role="region" aria-label={categoryLabels[category]}>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={linkClasses(item.path)}
                      title={isCollapsed ? item.label : ""}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div
                        className={`p-2 rounded-lg transition-colors ${
                          isActive ? "bg-blue-200" : "bg-white"
                        }`}
                      >
                        <Icon
                          className={`text-lg transition-colors ${
                            isActive ? "text-blue-700" : "text-blue-600 group-hover:text-blue-800"
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                      {!isCollapsed && (
                        <>
                          <span className="font-medium flex-1 transition-colors">{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-1 text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-medium shadow-sm select-none">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {isActive && (
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-l-full shadow-lg"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Nếu isCollapsed = true thì luôn show tất cả item
                (Không ẩn menu item khi sidebar bị thu nhỏ) */}
            {isCollapsed && (
              <div className="space-y-1" role="region" aria-label={categoryLabels[category]}>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={linkClasses(item.path)}
                      title={item.label}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div
                        className={`p-2 rounded-lg transition-colors ${
                          isActive ? "bg-blue-200" : "bg-white"
                        }`}
                      >
                        <Icon
                          className={`text-lg transition-colors ${
                            isActive ? "text-blue-700" : "text-blue-600 group-hover:text-blue-800"
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                      {!isCollapsed && (
                        <>
                          <span className="font-medium flex-1 transition-colors">{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-1 text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-medium shadow-sm select-none">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {isActive && (
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-l-full shadow-lg"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Stats Mini Cards */}
      {!isCollapsed && (
        <div className="p-4 border-t border-blue-400/30 bg-[#d0e2ff]">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-200 flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow">
                <FaBicycle className="text-blue-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-blue-900 font-medium mb-1">Xe Hoạt Động</p>
                <p className="text-lg font-bold text-blue-900">8/9</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-200 flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shadow">
                <FaUser className="text-green-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-green-900 font-medium mb-1">Người Dùng</p>
                <p className="text-lg font-bold text-green-900">24</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <div className="p-4 border-t border-blue-400/30">
        <div className="bg-white rounded-xl shadow p-4">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-4 py-3 text-blue-700 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-300 group border border-transparent ${
              isCollapsed ? "justify-center" : ""
            }`}
            aria-label="Logout"
            title="Logout"
            type="button"
          >
            <div className="p-2 rounded-lg group-hover:bg-red-700 transition-colors">
              <FaSignOutAlt className="text-lg group-hover:text-white transition-colors" />
            </div>
            {!isCollapsed && <span className="font-medium">Đăng Xuất</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
