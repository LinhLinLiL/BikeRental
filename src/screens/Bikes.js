import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Bike,
  Lock,
  User,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
} from "lucide-react";
import { db } from "../firebase";
import { ref, onValue, set, update, remove } from "firebase/database";

export default function BikesManagement() {
  // Danh sách bike realtime
  const [bikes, setBikes] = useState([]);
  // Danh sách lock realtime
  const [locks, setLocks] = useState([]);

  // Filter
  const [filter, setFilter] = useState({
    bikeId: "",
    currentLockId: "",
    status: "",
    currentUserId: "",
  });

  // Form thêm bike show/hide
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit state
  const [editBikeId, setEditBikeId] = useState(null);
  const [editBikeData, setEditBikeData] = useState({});

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // State form thêm bike mới
  const [newBike, setNewBike] = useState({
    bikeId: "",
    currentLockId: "",
    status: "locked",
    currentUserId: "none",
  });

  // Load dữ liệu realtime bikes
  useEffect(() => {
    const bikesRef = ref(db, "bikes");
    const unsubscribe = onValue(bikesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const bikeList = Object.entries(data).map(([id, bike]) => ({
          id,
          ...bike,
        }));
        setBikes(bikeList);
      } else {
        setBikes([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load dữ liệu realtime locks
  useEffect(() => {
    const locksRef = ref(db, "locks");
    const unsubscribe = onValue(locksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lockList = Object.entries(data).map(([id, lock]) => ({
          id,
          ...lock,
        }));
        setLocks(lockList);
      } else {
        setLocks([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Hàm lấy danh sách tất cả lockId hiện có
  const allLockIds = locks.map((lock) => lock.lockId).filter(Boolean);

  // Hàm lấy danh sách lock đã dùng trong xe
  const usedLockIds = bikes
    .map((bike) => bike.currentLockId)
    .filter((lid) => !!lid && lid !== "none");

  // Lock options để chọn khi thêm xe là lock tồn tại và chưa được sử dụng
  const lockOptions = allLockIds.filter((lockId) => !usedLockIds.includes(lockId));

  // Danh sách bikeId đang có
  const currentBikeIds = bikes.map((b) => b.bikeId);

  // Hàm tìm số lớn nhất bikeId để tạo bikeId mới tránh trùng
  const getMaxBikeNumber = (bikesList) => {
    let max = 0;
    bikesList.forEach(({ bikeId }) => {
      if (bikeId && bikeId.startsWith("bike")) {
        const num = parseInt(bikeId.slice(4), 10);
        if (!isNaN(num) && num > max) max = num;
      }
    });
    return max;
  };

  // Tạo bikeId mới không trùng
  const createNewBikeId = () => {
    const maxNum = getMaxBikeNumber(bikes);
    let candidateId = `bike${maxNum + 1}`;

    if (!currentBikeIds.includes(candidateId)) return candidateId;

    let newNum = maxNum + 2;
    while (currentBikeIds.includes(`bike${newNum}`)) {
      newNum++;
    }
    return `bike${newNum}`;
  };

  // Reset form thêm bike mới
  const resetNewBikeForm = () => {
    setNewBike({
      bikeId: createNewBikeId(),
      currentLockId: "",
      status: "locked",
      currentUserId: "none",
    });
  };

  // Mở/đóng form thêm bike
  const handleToggleAddForm = () => {
    if (!showAddForm) resetNewBikeForm();
    setShowAddForm(!showAddForm);
  };

  // Filter danh sách bike
  const filteredBikes = bikes.filter((bike) => {
    const matchBikeId = filter.bikeId === "" || bike.bikeId === filter.bikeId;
    const matchLockId =
      filter.currentLockId === "" || bike.currentLockId === filter.currentLockId;
    const matchStatus = filter.status === "" || bike.status === filter.status;

    const inputUser = filter.currentUserId.trim().toLowerCase();
    const bikeUser = (bike.currentUserId || "none").toLowerCase();
    const matchUser = inputUser === "" || bikeUser.includes(inputUser);

    return matchBikeId && matchLockId && matchStatus && matchUser;
  });

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredBikes.length / itemsPerPage);

  // Lấy bikes của trang hiện tại
  const currentBikes = filteredBikes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Khi filter hoặc dữ liệu bikes thay đổi, reset trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, bikes.length]);

  // Chuyển trang
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Reset filter
  const clearFilters = () => {
    setFilter({
      bikeId: "",
      currentLockId: "",
      status: "",
      currentUserId: "",
    });
  };

  // Hiển thị badge trạng thái bike
  const getStatusBadge = (status) => {
    if (status === "locked") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Lock className="w-3 h-3 mr-1" />
          Locked
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Unlocked
      </span>
    );
  };

  // Thêm bike với ID key chính là bikeId
  const handleAddBike = () => {
    if (!newBike.bikeId) {
      alert("Bike ID chưa có!");
      return;
    }
    if (!newBike.currentLockId) {
      alert("Vui lòng chọn Lock ID.");
      return;
    }
    if (lockOptions.length === 0) {
      alert("Hết lock chưa có xe! Vui lòng thêm lock mới trước khi thêm bike.");
      return;
    }
    if (!lockOptions.includes(newBike.currentLockId)) {
      alert(`Lock ID ${newBike.currentLockId} đã có xe khác sử dụng hoặc không tồn tại. Vui lòng chọn lock khác.`);
      return;
    }
    if (currentBikeIds.includes(newBike.bikeId)) {
      alert(`Bike ID ${newBike.bikeId} đã tồn tại.`);
      return;
    }

    const bikeRef = ref(db, `bikes/${newBike.bikeId}`);
    set(bikeRef, newBike)
      .then(() => {
        setShowAddForm(false);
        resetNewBikeForm();
      })
      .catch((e) => alert("Error adding bike: " + e.message));
  };

  // Các hàm chỉnh sửa bike
  const handleEditClick = (bike) => {
    setEditBikeId(bike.id);
    setEditBikeData({ ...bike });
  };

  const handleCancelEdit = () => {
    setEditBikeId(null);
    setEditBikeData({});
  };

  const handleSaveEdit = () => {
    if (!editBikeId) return;
    const bikeRef = ref(db, `bikes/${editBikeId}`);
    update(bikeRef, editBikeData)
      .then(() => {
        setEditBikeId(null);
        setEditBikeData({});
      })
      .catch((e) => alert("Error updating bike: " + e.message));
  };

  // Xóa bike
  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa bike này?")) return;
    const bikeRef = ref(db, `bikes/${id}`);
    remove(bikeRef).catch((e) => alert("Error deleting bike: " + e.message));
  };

  // Xem chi tiết bike
  const handleView = (bike) => {
    alert(
      `View bike:\nID: ${bike.bikeId}\nStatus: ${bike.status}\nLock: ${bike.currentLockId}\nUser: ${bike.currentUserId}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Bike className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bike Management</h1>
              <p className="text-gray-600">Quản lý và theo dõi hệ thống xe đạp</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-blue-600">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={handleToggleAddForm}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showAddForm ? "Close Add Bike" : "Add Bike"}
            </button>
          </div>
        </div>

        {/* Form thêm bike */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Add New Bike</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close add form"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bike ID</label>
                <input
                  type="text"
                  value={newBike.bikeId}
                  readOnly
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lock ID</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  value={newBike.currentLockId}
                  onChange={(e) => setNewBike({ ...newBike, currentLockId: e.target.value })}
                >
                  <option value="">Select Lock ID</option>
                  {lockOptions.length > 0 ? (
                    lockOptions.map((id) => (
                      <option key={id} value={id}>
                        {id}
                      </option>
                    ))
                  ) : (
                    <option disabled>-- Hết lock chưa có xe --</option>
                  )}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddBike}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Bike
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Bikes"
            value={bikes.length}
            icon={<Bike className="w-6 h-6 text-blue-600" />}
            bg="bg-blue-100"
          />
          <StatCard
            title="Available"
            value={bikes.filter((b) => b.status === "unlocked").length}
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
            bg="bg-green-100"
          />
          <StatCard
            title="In Use"
            value={bikes.filter((b) => b.status === "locked").length}
            icon={<Lock className="w-6 h-6 text-red-600" />}
            bg="bg-red-100"
          />
          <StatCard
            title="Active Users"
            value={bikes.filter((b) => b.currentUserId !== "none").length}
            icon={<User className="w-6 h-6 text-purple-600" />}
            bg="bg-purple-100"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            </div>
            <button
              onClick={clearFilters}
              className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Clear
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bike ID</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                value={filter.bikeId}
                onChange={(e) => setFilter({ ...filter, bikeId: e.target.value })}
              >
                <option value="">Tất cả</option>
                {[...new Set(bikes.map((b) => b.bikeId))].map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Lock</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                value={filter.currentLockId}
                onChange={(e) => setFilter({ ...filter, currentLockId: e.target.value })}
              >
                <option value="">Tất cả</option>
                {[...new Set(bikes.map((b) => b.currentLockId).filter(Boolean))].map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              >
                <option value="">Tất cả</option>
                <option value="locked">Locked</option>
                <option value="unlocked">Unlocked</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current User</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Search User ID or 'none'"
                  value={filter.currentUserId}
                  onChange={(e) => setFilter({ ...filter, currentUserId: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bảng hiển thị bikes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Bikes ({filteredBikes.length})
              </h3>
              <div className="text-sm text-gray-500">
                Showing {currentBikes.length} of {filteredBikes.length} bikes (Page {currentPage} of {totalPages})
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bike
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Lock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentBikes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-500">
                      <Bike className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      Không có dữ liệu phù hợp
                      <br />
                      <span className="text-gray-400 text-sm">
                        Thử điều chỉnh bộ lọc để xem thêm kết quả
                      </span>
                    </td>
                  </tr>
                )}
                {currentBikes.map((bike) =>
                  editBikeId === bike.id ? (
                    <tr
                      key={bike.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-2 py-2">
                        <div className="text-gray-600 select-none">{bike.bikeId}</div>
                      </td>
                      <td className="px-2 py-2">
                        <select
                          className="w-full border rounded px-2 py-1"
                          value={editBikeData.status}
                          onChange={(e) =>
                            setEditBikeData({ ...editBikeData, status: e.target.value })
                          }
                        >
                          <option value="locked">Locked</option>
                          <option value="unlocked">Unlocked</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <select
                          className="w-full border rounded px-2 py-1"
                          value={editBikeData.currentLockId}
                          onChange={(e) =>
                            setEditBikeData({ ...editBikeData, currentLockId: e.target.value })
                          }
                        >
                          <option value="">None</option>
                          {lockOptions.map((id) => (
                            <option key={id} value={id}>
                              {id}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          className="w-full border rounded px-2 py-1"
                          value={editBikeData.currentUserId}
                          onChange={(e) =>
                            setEditBikeData({ ...editBikeData, currentUserId: e.target.value })
                          }
                        />
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <button
                          onClick={handleSaveEdit}
                          className="text-blue-600 hover:underline mr-2"
                          title="Lưu"
                        >
                          💾
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:underline"
                          title="Huỷ"
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={bike.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-purple-100 rounded-lg mr-3">
                            <span className="text-purple-600">
                              {getGenderIcon(bike.gender)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{bike.name || "N/A"}</div>
                            <div className="text-sm text-gray-500">ID: {bike.bikeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(bike.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Lock className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{bike.currentLockId || "None"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <span
                            className={`text-sm ${
                              bike.currentUserId === "none" ? "text-gray-500 italic" : "text-gray-900"
                            }`}
                          >
                            {bike.currentUserId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View"
                            onClick={() => handleView(bike)}
                          >
                            👁️
                          </button>
                          <button
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Edit"
                            onClick={() => handleEditClick(bike)}
                          >
                            ✏️
                          </button>
                          <button
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                            onClick={() => handleDelete(bike.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 flex justify-center space-x-3">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
              >
                {"<"} Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-1 rounded border ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
              >
                Next {">"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Component thống kê nhỏ gọn
function StatCard({ title, value, icon, bg }) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center justify-between`}>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`${bg} p-3 rounded-lg`}>{icon}</div>
    </div>
  );
}

// Lấy icon giới tính nếu có trong dữ liệu bike (nếu cần)
const getGenderIcon = (gender) => {
  if (gender?.toLowerCase() === "male") return "👨";
  if (gender?.toLowerCase() === "female") return "👩";
  return "👤";
};
