import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";

import useBikesData from "./hooks/useBikesData";
import FilterPanel from "./FilterPanel";
import BikesTable from "./BikesTable";
import StatCard from "./StatCards";
import AddBikeForm from "./AddBikeForm";

import { Bike, Lock, CheckCircle, User, Plus  } from "lucide-react";

export default function BikesManagement() {
  const navigate = useNavigate();

  // State xác thực đăng nhập
  const [authChecked, setAuthChecked] = useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login", { replace: true });
      else setAuthChecked(true);
    });
    return () => unsubscribe();
  }, [navigate]);

  // Gọi hook load data và logic (chỉ khi đã auth)
  const {
    bikes,
    // locks,
    filter,
    setFilter,
    // filteredBikes,
    currentBikes,
    editBikeId,
    editBikeData,
    // setEditBikeId,
    setEditBikeData,
    newBike,
    setNewBike,
    resetNewBikeForm,
    lockOptions,
    allLockIds,
    handleAddBike,
    handleEditClick,
    handleCancelEdit,
    handleSaveEdit,
    handleDelete,
    handleView,
    goToPage,
    totalPages,
    currentPage,
    getStatusBadge,
  } = useBikesData(authChecked);

  // Quản lý hiện form thêm xe
  const [showAddForm, setShowAddForm] = useState(false);

  const handleToggleAddForm = () => {
    if (!showAddForm) resetNewBikeForm();
    setShowAddForm(!showAddForm);
  };

  if (!authChecked) {
    return <div className="min-h-screen flex items-center justify-center">Đang kiểm tra đăng nhập...</div>;
  }

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
             <button
              className="flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
              onClick={() => alert("Chức năng Export chưa có")}
            >
              📥 Export
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
          <AddBikeForm newBike={newBike} setNewBike={setNewBike} lockOptions={lockOptions} onAddBike={handleAddBike} onCancel={() => setShowAddForm(false)} />
        )}

        {/* Card thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard title="Total Bikes" value={bikes.length} icon={<Bike className="w-6 h-6 text-blue-600" />} bg="bg-blue-100" />
          <StatCard title="Available" value={bikes.filter((b) => b.status === "unlocked").length} icon={<CheckCircle className="w-6 h-6 text-green-600" />} bg="bg-green-100" />
          <StatCard title="In Use" value={bikes.filter((b) => b.status === "locked").length} icon={<Lock className="w-6 h-6 text-red-600" />} bg="bg-red-100" />
          <StatCard title="Active Users" value={bikes.filter((b) => b.currentUserId !== "none").length} icon={<User className="w-6 h-6 text-purple-600" />} bg="bg-purple-100" />
        </div>

        {/* Filter Panel */}
        <FilterPanel filter={filter} setFilter={setFilter} clearFilters={() => setFilter({ bikeId: "", currentLockId: "", status: "", currentUserId: "" })} bikes={bikes}  allLockIds={allLockIds}  />

        {/* Bikes Table */}
        <BikesTable
          bikes={currentBikes}
          editBikeId={editBikeId}
          editBikeData={editBikeData}
          setEditBikeData={setEditBikeData}
          handleEditClick={handleEditClick}
          handleSaveEdit={handleSaveEdit}
          handleCancelEdit={handleCancelEdit}
          handleDelete={handleDelete}
          handleView={handleView}
          getStatusBadge={getStatusBadge}
          currentPage={currentPage}
          totalPages={totalPages}
          goToPage={goToPage}
          lockOptions={lockOptions}
          getGenderIcon={() => "🚲"}
        />
      </div>
    </div>
  );
}
