import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, update, remove, push } from "firebase/database";
import {
  Search,
  Users as UsersIcon,
  Bike,
  X,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [search, setSearch] = useState({
    userId: "",
    email: "",
    name: "",
    age: "",
    gender: "",
    selectedBikeId: "",
    role: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Kiểm tra có admin trong users để hiện cột Role
  const hasAdmin = users.some((u) => u.role === "admin");

  useEffect(() => {
    const usersRef = ref(db, "users");
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.entries(data).map(([id, user]) => ({ id, ...user }));
        setUsers(userList);
      } else {
        setUsers([]);
      }
    });

    const bikesRef = ref(db, "bikes");
    const unsubscribeBikes = onValue(bikesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const bikeList = Object.entries(data).map(([key, bike]) => bike.bikeId || key);
        setBikes(bikeList);
      } else {
        setBikes([]);
      }
    });

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

  const filteredUsers = users.filter((u) =>
    Object.keys(search).every((key) => {
      const userValue = (u[key] || "").toString().toLowerCase();
      const searchValue = search[key].toLowerCase();

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

  const searchString = JSON.stringify(search);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchString]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

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

  const getGenderIcon = (gender) => {
    if (gender?.toLowerCase() === "male") return "👨";
    if (gender?.toLowerCase() === "female") return "👩";
    return "👤";
  };

  const getBikeStatus = (bikeId) => {
    if (!bikeId || bikeId === "none") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          🚫 No Bike
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        🚲 {bikeId}
      </span>
    );
  };

  const startEditing = (user) => {
    setEditingUserId(user.id);
    setEditedUser({ ...user });
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditedUser({});
  };

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
      setEditingUserId(null);
      setEditedUser({});
    } catch (err) {
      console.error("Lỗi khi cập nhật user:", err);
      alert("Không thể cập nhật user.");
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Xác nhận xoá người dùng ${user.userId}?`)) return;
    try {
      const userRef = ref(db, `users/${user.id}`);
      await remove(userRef);
    } catch (err) {
      console.error("Lỗi khi xoá user:", err);
      alert("Không thể xoá user.");
    }
  };

  // Generate random user id for AddUserForm
  const isDuplicateUserId = (idToCheck) => users.some((u) => u.userId === idToCheck);

  const generateRandomUserId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id;
    do {
      id = "";
      for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (isDuplicateUserId(id));
    return id;
  };

  const AddUserFormWithAutoUserId = () => {
    const [formData, setFormData] = useState({
      userId: generateRandomUserId(),
      email: "",
      name: "",
      age: "",
      gender: "",
      selectedBikeId: "none", // disabled
      role: "user",
    });

    const resetForm = () => {
      setFormData({
        userId: generateRandomUserId(),
        email: "",
        name: "",
        age: "",
        gender: "",
        selectedBikeId: "none",
        role: "user",
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.email || !formData.name) {
        alert("Vui lòng nhập đủ Email và Name");
        return;
      }
      try {
        const usersRef = ref(db, "users");
        const preparedData = {
          ...formData,
          selectedBikeId: "none",
          role: formData.role === "admin" ? "admin" : "user",
        };
        await push(usersRef, preparedData);
        alert("Thêm user thành công!");
        resetForm();
        setShowAddForm(false);
      } catch (err) {
        console.error("Lỗi khi thêm user:", err);
        alert("Không thể thêm user.");
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">User ID (tự sinh)</label>
          <input
            type="text"
            value={formData.userId}
            readOnly
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Age</label>
          <input
            type="number"
            min={0}
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Chọn giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>
        </div>
        {/* Disabled bike selection */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Selected Bike</label>
          <select
            disabled
            value="none"
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          >
            <option value="none">Không có xe</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-600"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            className="px-4 py-2 border rounded text-blue-600 hover:bg-blue-100 transition"
          >
            Huỷ
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Thêm User
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
            <button className="flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition">
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close form"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <AddUserFormWithAutoUserId />
          </div>
        )}

        {/* Stats Cards */}
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

        {/* Search Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-300 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3 text-gray-700">
              <Search className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold">Search & Filters</h3>
            </div>
            <button
              onClick={clearSearch}
              className="px-3 py-1.5 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
            >
              🔄 Clear
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                placeholder="Search User ID"
                value={search.userId}
                onChange={(e) => setSearch({ ...search, userId: e.target.value })}
                type="search"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                placeholder="Search Email"
                value={search.email}
                onChange={(e) => setSearch({ ...search, email: e.target.value })}
                type="search"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                placeholder="Search Name"
                value={search.name}
                onChange={(e) => setSearch({ ...search, name: e.target.value })}
                type="search"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                placeholder="Search Age"
                value={search.age}
                onChange={(e) => setSearch({ ...search, age: e.target.value })}
                type="number"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                value={search.gender}
                onChange={(e) => setSearch({ ...search, gender: e.target.value })}
              >
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="nam">Nam</option>
                <option value="nữ">Nữ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selected Bike</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                value={search.selectedBikeId}
                onChange={(e) => setSearch({ ...search, selectedBikeId: e.target.value })}
              >
                <option value="">All Bikes</option>
                <option value="none">None</option>
                {bikes.map((bikeId, index) => (
                  <option key={bikeId || index} value={bikeId}>
                    {bikeId}
                  </option>
                ))}
              </select>
            </div>
            {hasAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  value={search.role || ""}
                  onChange={(e) => setSearch({ ...search, role: e.target.value })}
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Users ({filteredUsers.length})
              </h3>
              <div className="text-sm text-gray-500">
                Showing {currentUsers.length} of {filteredUsers.length} filtered users (Page {currentPage} of {totalPages})
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Bike Status
                  </th>
                  {hasAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={hasAdmin ? 6 : 5}
                      className="text-center py-12 text-gray-500"
                    >
                      No matching users found.
                    </td>
                  </tr>
                )}
                {currentUsers.map((user) => {
                  if (editingUserId === user.id) {
                    return (
                      <tr
                        key={`edit-${user.id}`}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="text-gray-600 select-none font-medium">
                            {user.userId}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="email"
                            className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-600"
                            value={editedUser.email || ""}
                            onChange={(e) =>
                              setEditedUser({ ...editedUser, email: e.target.value })
                            }
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="space-y-2">
                            <input
                              type="number"
                              min={0}
                              placeholder="Age"
                              className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-600"
                              value={editedUser.age || ""}
                              onChange={(e) =>
                                setEditedUser({ ...editedUser, age: e.target.value })
                              }
                            />
                            <select
                              className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-600"
                              value={editedUser.gender || ""}
                              onChange={(e) =>
                                setEditedUser({ ...editedUser, gender: e.target.value })
                              }
                            >
                              <option value="">Chọn giới tính</option>
                              <option value="male">Nam</option>
                              <option value="female">Nữ</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <select
                            className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-600"
                            value={editedUser.selectedBikeId || "none"}
                            onChange={(e) =>
                              setEditedUser({ ...editedUser, selectedBikeId: e.target.value })
                            }
                          >
                            <option value="none">Không có xe</option>
                            {bikes.map((bikeId, index) => (
                              <option key={bikeId || index} value={bikeId}>
                                {bikeId}
                              </option>
                            ))}
                          </select>
                        </td>
                        {hasAdmin && (
                          <td className="px-3 py-2 whitespace-nowrap">
                            <select
                              className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-600"
                              value={editedUser.role || "user"}
                              onChange={(e) =>
                                setEditedUser({ ...editedUser, role: e.target.value })
                              }
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                        )}
                        <td className="px-3 py-2 whitespace-nowrap space-x-2">
                          <button
                            onClick={saveUser}
                            className="text-green-600 hover:text-green-800"
                            title="Save"
                            aria-label="Save user"
                          >
                            💾
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-800"
                            title="Cancel"
                            aria-label="Cancel editing"
                          >
                            ❌
                          </button>
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr
                      key={`view-${user.id}`}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <span className="text-blue-600">{getGenderIcon(user.gender)}</span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{user.name || "N/A"}</div>
                          <div className="text-xs text-gray-500">ID: {user.userId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email || "N/A"}</div>
                        <div className="text-xs text-gray-500">📧 Email</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex flex-col space-y-1">
                        <span className="text-sm font-medium text-gray-900">{user.age || "N/A"}</span>
                        <span className="text-xs text-gray-500 capitalize">{user.gender || "N/A"}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getBikeStatus(user.selectedBikeId)}</td>
                      {hasAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {user.role === "admin" ? (
                            <span className="inline-flex items-center text-red-600 font-semibold space-x-1">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Admin</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-green-600 font-semibold">
                              <CheckCircle className="w-4 h-4" />
                              <span>User</span>
                            </span>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-3">
                        <button
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                          title="View"
                          onClick={() => alert(`User Details:\n${JSON.stringify(user, null, 2)}`)}
                          aria-label="View user"
                        >
                          👁️
                        </button>
                        <button
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                          title="Edit"
                          onClick={() => startEditing(user)}
                          aria-label="Edit user"
                        >
                          ✏️
                        </button>
                        <button
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                          title="Delete"
                          onClick={() => deleteUser(user)}
                          aria-label="Delete user"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-center space-x-3">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-blue-50 transition"
              >
                &lt; Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-4 py-2 rounded-lg border font-semibold transition ${
                    currentPage === pageNum
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-blue-50 transition"
              >
                Next &gt;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
