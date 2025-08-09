import React, { useState, useEffect, useMemo } from "react";
import { db } from "../../firebase";
import { ref, onValue, update, remove, push } from "firebase/database";
import { Users as UsersIcon, Bike } from "lucide-react";

import FilterPanel from "./FilterPanel";  // Giả sử bạn tách filter ra
import UsersTable from "./UsersTable";    // Bảng user
import AddUserForm from "./AddUserForm";  // Form thêm user

export default function UsersManagement() {
  // State dữ liệu
  const [users, setUsers] = useState([]);
  const [bikes, setBikes] = useState([]);

  // Filter search state
  const [search, setSearch] = useState({
    userId: "",
    email: "",
    name: "",
    age: "",
    gender: "",
    selectedBikeId: "",
    role: "",
  });

  // Quản lý form thêm user
  const [showAddForm, setShowAddForm] = useState(false);

  // Quản lý edit inline
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({});

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Load dữ liệu realtime users & bikes
  useEffect(() => {
    const usersRef = ref(db, "users");
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, user]) => ({ id, ...user }));
        setUsers(list);
      } else {
        setUsers([]);
      }
    });

    const bikesRef = ref(db, "bikes");
    const unsubscribeBikes = onValue(bikesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, bike]) => bike.bikeId || key);
        setBikes(list);
      } else {
        setBikes([]);
      }
    });

    // Cleanup
    return () => {
      unsubscribeUsers();
      unsubscribeBikes();
    };
  }, []);

  const normalizeGender = (g) => {
    if (!g) return "";
    const lower = g.toLowerCase();
    if (["male", "nam"].includes(lower)) return "male";
    if (["female", "nữ", "nu"].includes(lower)) return "female";
    return lower;
  };

  // Lọc users theo filter search
  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      Object.keys(search).every((key) => {
        const userValue = (u[key] || "").toString().toLowerCase();
        const searchValue = (search[key] || "").toString().toLowerCase();

        if (key === "gender") {
          if (!searchValue) return true;
          return normalizeGender(userValue) === normalizeGender(searchValue);
        }
        if (key === "selectedBikeId") {
          if (searchValue === "") return true;
          if (searchValue === "none") return userValue === "none";
          return userValue === searchValue;
        }
        if (key === "role") {
          if (!searchValue) return true;
          return userValue === searchValue;
        }
        return userValue.includes(searchValue);
      })
    );
  }, [users, search]);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Tính số trang và chọn users hiện trang
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Hủy edit
  const cancelEditing = () => {
    setEditingUserId(null);
    setEditedUser({});
  };

  // Lưu user sau edit
  const saveUser = async () => {
    if (!editedUser.id) return;
    try {
      const userRef = ref(db, `users/${editedUser.id}`);
      const dataToSave = {
        userId: editedUser.userId || "",
        email: editedUser.email || "",
        name: editedUser.name || "",
        age: editedUser.age || "",
        gender: editedUser.gender || "",
        selectedBikeId:
          !editedUser.selectedBikeId || editedUser.selectedBikeId === "none"
            ? "none"
            : editedUser.selectedBikeId,
        role: editedUser.role === "admin" ? "admin" : "user",
      };
      await update(userRef, dataToSave);
      cancelEditing();
    } catch (err) {
      alert("Không thể cập nhật user.");
      console.error(err);
    }
  };

  // Xóa user
  const deleteUser = async (user) => {
    if (!window.confirm(`Xác nhận xoá người dùng ${user.userId}?`)) return;
    try {
      const userRef = ref(db, `users/${user.id}`);
      await remove(userRef);
    } catch (err) {
      alert("Không thể xoá user.");
      console.error(err);
    }
  };

  // Clear filter
  const clearSearch = () => {
    setSearch({
      userId: "",
      email: "",
      name: "",
      age: "",
      gender: "",
      selectedBikeId: "",
      role: "",
    });
  };

  // Thêm user mới
  const handleAddUser = async (formData) => {
    try {
      const usersRef = ref(db, "users");
      const preparedData = {
        ...formData,
        selectedBikeId: "none",
        role: formData.role === "admin" ? "admin" : "user",
      };
      await push(usersRef, preparedData);
      alert("Thêm user thành công!");
      setShowAddForm(false);
    } catch (err) {
      alert("Không thể thêm user.");
      console.error(err);
    }
  };

  const hasAdmin = users.some((u) => u.role === "admin");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header + các nút */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-full shadow-lg">
              <UsersIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Quản lý thông tin người dùng hệ thống</p>
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
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              ➕ Add User
            </button>
          </div>
        </div>

        {/* Add User Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-300 p-8 mb-8">
            <AddUserForm
              users={users}
              onSubmit={handleAddUser}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* Cards Tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-300 p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <UsersIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-300 p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase">With Bikes</p>
              <p className="text-3xl font-bold text-blue-600">
                {users.filter((u) => u.selectedBikeId && u.selectedBikeId !== "none").length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Bike className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-300 p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase">Male Users</p>
              <p className="text-3xl font-bold text-blue-600">
                {users.filter((u) => normalizeGender(u.gender) === "male").length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-4xl">👨</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-300 p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase">Female Users</p>
              <p className="text-3xl font-bold text-blue-600">
                {users.filter((u) => normalizeGender(u.gender) === "female").length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-4xl">👩</span>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <FilterPanel filter={search} setFilter={setSearch} clearFilter={clearSearch} bikes={bikes} />

        {/* Users Table */}
        <UsersTable
          users={currentUsers}
          bikes={bikes}
          editingUserId={editingUserId}
          editedUser={editedUser}
          setEditedUser={setEditedUser}
          setEditingUserId={setEditingUserId}
          saveUser={saveUser}
          cancelEditing={cancelEditing}
          deleteUser={deleteUser}
          normalizeGender={normalizeGender}
          hasAdmin={hasAdmin}
          currentPage={currentPage}
          totalPages={totalPages}
          goToPage={goToPage}
        />
      </div>
    </div>
  );
}
