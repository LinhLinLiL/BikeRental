import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Key,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
} from "lucide-react";
import { db, auth } from "../firebase";
import { ref, onValue, set, update, remove } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function LocksManagement() {
  const [locks, setLocks] = useState([]);
  const [filter, setFilter] = useState({
    lockId: "",
    status: "",
    bikeId: "",
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const [editLockId, setEditLockId] = useState(null);
  const [editLockData, setEditLockData] = useState({});

  const [newLock, setNewLock] = useState({
    lockId: "",
    status: "Khóa Mở", // Mặc định khóa mở khi thêm mới
    bikeId: "",
    isValid: false,
    occupied: false,
    otp: "",
    otpTimestamp: 0,
    returnBikeId: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login", { replace: true });
      } else {
        setAuthChecked(true);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!authChecked) return;
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
  }, [authChecked]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, locks.length]);

  if (!authChecked)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Đang kiểm tra đăng nhập...
      </div>
    );

  const currentLockIds = locks.map((l) => l.lockId);

  const getMaxLockNumber = (locksList) => {
    let max = 0;
    locksList.forEach(({ lockId }) => {
      if (lockId && lockId.startsWith("lock")) {
        const num = parseInt(lockId.slice(4), 10);
        if (!isNaN(num) && num > max) max = num;
      }
    });
    return max;
  };

  const createNewLockId = () => {
    const maxNum = getMaxLockNumber(locks);
    let candidate = `lock${maxNum + 1}`;
    if (!currentLockIds.includes(candidate)) return candidate;
    let newNum = maxNum + 2;
    while (currentLockIds.includes(`lock${newNum}`)) {
      newNum++;
    }
    return `lock${newNum}`;
  };

  const resetNewLockForm = () => {
    setNewLock({
      lockId: createNewLockId(),
      status: "Khóa Mở",
      bikeId: "",
      isValid: false,
      occupied: false,
      otp: "",
      otpTimestamp: 0,
      returnBikeId: "",
    });
  };

  const handleToggleAddForm = () => {
    if (!showAddForm) resetNewLockForm();
    setShowAddForm(!showAddForm);
  };

  const filteredLocks = locks.filter((lock) => {
    const matchLockId = filter.lockId === "" || lock.lockId === filter.lockId;

    // Viết hoa "Có Xe" để đồng bộ
    const lockStatus =
      lock.isValid && lock.occupied ? "Có Xe, Khóa Đóng" : "Khóa Mở";

    const matchStatus = filter.status === "" || lockStatus === filter.status;

    const inputBikeId = filter.bikeId.trim().toLowerCase();
    const bikeIdInLock = (lock.bikeId || "").toLowerCase();
    const matchBikeId = inputBikeId === "" || bikeIdInLock.includes(inputBikeId);

    return matchLockId && matchStatus && matchBikeId;
  });

  const totalPages = Math.ceil(filteredLocks.length / itemsPerPage);
  const currentLocks = filteredLocks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setFilter({ lockId: "", status: "", bikeId: "" });
  };

  const getStatusBadge = (lock) => {
    if (lock.isValid && lock.occupied) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Có Xe, Khóa Đóng
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Khóa Mở
      </span>
    );
  };

  const handleAddLock = () => {
    if (!newLock.lockId) {
      alert("Lock ID chưa có!");
      return;
    }
    if (currentLockIds.includes(newLock.lockId)) {
      alert(`Lock ID ${newLock.lockId} đã tồn tại.`);
      return;
    }

    const lockToAdd = {
      lockId: newLock.lockId,
      status: "Khóa Mở",
      // bikeId: "newLock.bikeId",
      bikeId: "",
      isValid: false,
      occupied: false,
      otp: "",
      otpTimestamp: 0,
      returnBikeId: "",
    };

    const lockRef = ref(db, `locks/${newLock.lockId}`);
    set(lockRef, lockToAdd)
      .then(() => {
        setShowAddForm(false);
        resetNewLockForm();
      })
      .catch((e) => alert("Lỗi khi thêm khóa: " + e.message));
  };

  const handleEditClick = (lock) => {
    setEditLockId(lock.id);
    setEditLockData({ ...lock });
  };

  const handleCancelEdit = () => {
    setEditLockId(null);
    setEditLockData({});
  };

  const handleSaveEdit = () => {
    if (!editLockId) return;

    const status =
      editLockData.isValid && editLockData.occupied
        ? "Có Xe, Khóa Đóng"
        : "Khóa Mở";

    const lockRef = ref(db, `locks/${editLockId}`);
    update(lockRef, { ...editLockData, status })
      .then(() => {
        setEditLockId(null);
        setEditLockData({});
      })
      .catch((e) => alert("Lỗi khi cập nhật khóa: " + e.message));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa khóa này?")) return;
    const lockRef = ref(db, `locks/${id}`);
    remove(lockRef).catch((e) => alert("Lỗi khi xóa khóa: " + e.message));
  };

  const handleView = (lock) => {
    alert(
      `Chi tiết khóa:
ID: ${lock.lockId}
Trạng thái: ${lock.isValid && lock.occupied ? "Có Xe, Khóa Đóng" : "Khóa Mở"}
Bike ID: ${lock.bikeId || "-"}
Is Valid: ${lock.isValid ? "Yes" : "No"}
Occupied: ${lock.occupied ? "Yes" : "No"}
OTP: ${lock.otp || "-"}
OTP Timestamp: ${lock.otpTimestamp ? new Date(lock.otpTimestamp).toLocaleString() : "-"}
Return Bike ID: ${lock.returnBikeId || "-"}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Key className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lock Management</h1>
              <p className="text-gray-600">Quản lý và theo dõi hệ thống khóa</p>
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
              {showAddForm ? "Close Add Lock" : "Add Lock"}
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Locks"
            value={locks.length}
            icon={<Key className="w-6 h-6 text-blue-600" />}
            bg="bg-blue-100"
          />
          <StatCard
            title="Có Xe, Khóa Đóng"
            value={locks.filter((l) => l.isValid && l.occupied).length}
            icon={<XCircle className="w-6 h-6 text-red-600" />}
            bg="bg-red-100"
          />
          <StatCard
            title="Khóa Mở"
            value={locks.filter((l) => !(l.isValid && l.occupied)).length}
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
            bg="bg-green-100"
          />
          <StatCard
            title="Occupied"
            value={locks.filter((l) => !!l.occupied).length}
            icon={<XCircle className="w-6 h-6 text-purple-600" />}
            bg="bg-purple-100"
          />
        </div>

        {/* Add lock form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Add New Lock</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close add form"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Chỉ nhập Lock ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lock ID</label>
                <input
                  type="text"
                  value={newLock.lockId}
                  readOnly
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                />
              </div>
{/* 
              Thêm nhập bikeId khi thêm mới nếu cần
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bike ID</label>
                <input
                  type="text"
                  value={newLock.bikeId}
                  onChange={(e) => setNewLock({ ...newLock, bikeId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Nhập Bike ID (nếu có)"
                />
              </div> */}

              <div className="flex items-end">
                <button
                  onClick={handleAddLock}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Thêm Khóa
                </button>
              </div>
            </div>
          </div>
        )}

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lock ID</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                value={filter.lockId}
                onChange={(e) => setFilter({ ...filter, lockId: e.target.value })}
              >
                <option value="">All</option>
                {[...new Set(locks.map((l) => l.lockId))].map((id) => (
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
                <option value="">All</option>
                <option value="Có Xe, Khóa Đóng">Có Xe, Khóa Đóng</option>
                <option value="Khóa Mở">Khóa Mở</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bike ID</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Search Bike ID"
                  value={filter.bikeId}
                  onChange={(e) => setFilter({ ...filter, bikeId: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Locks Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Locks ({filteredLocks.length})
              </h3>
              <div className="text-sm text-gray-500">
                Showing {currentLocks.length} of {filteredLocks.length} locks (Page {currentPage} of {totalPages})
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lock ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bike ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Is Valid</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupied</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OTP</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OTP Time</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Bike ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentLocks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-500">
                      No matching locks found
                    </td>
                  </tr>
                ) : (
                  currentLocks.map((lock) =>
                    editLockId === lock.id ? (
                      <tr key={lock.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 whitespace-nowrap">{lock.lockId}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{getStatusBadge(lock)}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="text"
                            value={editLockData.bikeId || ""}
                            onChange={(e) => setEditLockData({ ...editLockData, bikeId: e.target.value })}
                            className="border rounded px-2 py-1 w-full"
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={!!editLockData.isValid}
                            onChange={(e) => setEditLockData({ ...editLockData, isValid: e.target.checked })}
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={!!editLockData.occupied}
                            onChange={(e) => setEditLockData({ ...editLockData, occupied: e.target.checked })}
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="text"
                            value={editLockData.otp || ""}
                            onChange={(e) => setEditLockData({ ...editLockData, otp: e.target.value })}
                            className="border rounded px-2 py-1 w-full"
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="number"
                            value={editLockData.otpTimestamp || 0}
                            onChange={(e) => setEditLockData({ ...editLockData, otpTimestamp: Number(e.target.value) })}
                            className="border rounded px-2 py-1 w-full"
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="text"
                            value={editLockData.returnBikeId || ""}
                            onChange={(e) => setEditLockData({ ...editLockData, returnBikeId: e.target.value })}
                            className="border rounded px-2 py-1 w-full"
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <button
                            onClick={handleSaveEdit}
                            className="text-blue-600 hover:underline mr-2"
                            title="Save"
                          >
                            💾
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:underline"
                            title="Cancel"
                          >
                            ❌
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={lock.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 whitespace-nowrap">{lock.lockId}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{getStatusBadge(lock)}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{lock.bikeId || "-"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">{lock.isValid ? "Yes" : "No"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">{lock.occupied ? "Yes" : "No"}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{lock.otp || "-"}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {lock.otpTimestamp ? new Date(lock.otpTimestamp).toLocaleString() : "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">{lock.returnBikeId || "-"}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleView(lock)}
                              className="text-blue-600 hover:bg-blue-100 p-1 rounded"
                              title="View"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => handleEditClick(lock)}
                              className="text-green-600 hover:bg-green-100 p-1 rounded"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(lock.id)}
                              className="text-red-600 hover:bg-red-100 p-1 rounded"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
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
