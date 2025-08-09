import { useState, useEffect, useMemo  } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "./StatCard";
import FilterPanel from "./FilterPanel";
import LocksTable from "./LocksTable";
import LoadingScreen from "./LoadingScreen";

import useAuthCheck from "./hooks/useAuthCheck";
import useLocksData from "./hooks/useLocksData";
import { Key, XCircle, CheckCircle, Plus } from "lucide-react";


const LocksManagement = () => {
  const navigate = useNavigate();

  // Kiểm tra đăng nhập, điều hướng nếu chưa login
  const authChecked = useAuthCheck(navigate);

  // Quản lý filter state
  const [filter, setFilter] = useState({
    lockId: "",
    status: "",
    bikeId: "",
  });

  // Lấy dữ liệu khóa + xử lý filter + pagination
  const {
    locks,
    filteredLocks,
    // isLoading,
    currentPage,
    setCurrentPage,
    totalPages,
    editLockId,
    setEditLockId,
    editLockData,
    setEditLockData,
    newLock,
    setNewLock,
    showAddForm,
    setShowAddForm,
    createNewLockId,
    handleAddLock,
    handleDelete,
    handleView,
    handleEditClick,
    handleCancelEdit,
    handleSaveEdit,
    getStatusBadge,
    goToPage,
    clearFilters,
  } = useLocksData(authChecked, filter, setFilter);
  const lockIds = useMemo(() => [...new Set(locks.map(l => l.lockId))], [locks]);
  const bikeIds = useMemo(() => {
  // Lấy tất cả bikeId duy nhất từ danh sách locks (hoặc nơi bạn lưu bikeList nếu có)
  return [...new Set(locks.map(l => l.bikeId).filter(id => id))]; // lọc bỏ các giá trị falsy như "" hoặc undefined
}, [locks]);

  // Tự reset trang khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, setCurrentPage]);

  if (!authChecked)
    return (
      <LoadingScreen message="Đang kiểm tra đăng nhập..." />
    );

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
            <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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

        {/* Add/Edit Form & Filters */}
      <FilterPanel
  filter={filter}
  setFilter={setFilter}
  clearFilters={clearFilters}
  showAddForm={showAddForm}
  setShowAddForm={setShowAddForm}
  newLock={newLock}
  setNewLock={setNewLock}
  createNewLockId={createNewLockId}
  handleAddLock={handleAddLock}
  editLockId={editLockId}
  setEditLockId={setEditLockId}
  editLockData={editLockData}
  setEditLockData={setEditLockData}
  handleCancelEdit={handleCancelEdit}
  handleSaveEdit={handleSaveEdit}
  lockIds={lockIds}  // <-- Thêm prop này
   bikeIds={bikeIds}   // <-- Thêm prop này
/>


        {/* Locks Table */}
        <LocksTable
          locks={filteredLocks}
          currentPage={currentPage}
          totalPages={totalPages}
          goToPage={goToPage}
          editLockId={editLockId}
          setEditLockId={setEditLockId}
          editLockData={editLockData}
          setEditLockData={setEditLockData}
          getStatusBadge={getStatusBadge}
          handleDelete={handleDelete}
          handleView={handleView}
          handleEditClick={handleEditClick}
          handleCancelEdit={handleCancelEdit}
          handleSaveEdit={handleSaveEdit}
        />
      </div>
    </div>
  );
};

export default LocksManagement;
