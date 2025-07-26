import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, update, remove, push } from "firebase/database";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState({
    userId: "",
    email: "",
    name: "",
    age: "",
    gender: "",
    selectedBikeId: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const usersRef = ref(db, "users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.entries(data).map(([id, user]) => ({ id, ...user }));
        setUsers(userList);
      } else {
        setUsers([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Chuẩn hóa gender để lọc không phân biệt hoa thường
  const normalizeGender = (g) => {
    if (!g) return "";
    const lower = g.toLowerCase();
    if (["male", "nam"].includes(lower)) return "male";
    if (["female", "nữ", "nu"].includes(lower)) return "female";
    return lower;
  };

  // Filter users theo search với chuẩn hóa gender
  const filteredUsers = users.filter((u) =>
    Object.keys(search).every((key) => {
      const userValue = (u[key] || "").toString().toLowerCase();
      const searchValue = search[key].toLowerCase();

      if (key === "gender") {
        if (!searchValue) return true;
        return normalizeGender(userValue) === normalizeGender(searchValue);
      }

      if (key === "selectedBikeId") {
        return searchValue === ""
          ? true
          : searchValue === "none"
          ? userValue === "" || userValue === "none"
          : userValue === searchValue;
      }

      return userValue.includes(searchValue);
    })
  );

  const searchString = JSON.stringify(search);

  // Khi filter thay đổi, reset trang về 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchString]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Lấy users của trang hiện tại
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Chuyển trang
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
        selectedBikeId: editedUser.selectedBikeId || "none",
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

  // Tách hàm kiểm tra trùng userId ra ngoài vòng lặp
  const isDuplicateUserId = (idToCheck) => users.some((u) => u.userId === idToCheck);

  // Tạo User ID random, tránh trùng với userId hiện tại trong users
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

  // Form thêm người dùng mới có userId random
  const AddUserFormWithAutoUserId = () => {
    const [formData, setFormData] = useState({
      userId: generateRandomUserId(),
      email: "",
      name: "",
      age: "",
      gender: "",
      selectedBikeId: "none",
    });

    const resetForm = () => {
      setFormData({
        userId: generateRandomUserId(),
        email: "",
        name: "",
        age: "",
        gender: "",
        selectedBikeId: "none",
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
        await push(usersRef, formData);
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
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Age</label>
          <input
            type="number"
            min={0}
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Chọn giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Selected Bike</label>
          <select
            value={formData.selectedBikeId}
            onChange={(e) => setFormData({ ...formData, selectedBikeId: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="none">Không có xe</option>
            {Array.from({ length: 9 }).map((_, i) => {
              const bikeId = `bike${i + 1}`;
              return (
                <option key={bikeId} value={bikeId}>
                  {bikeId}
                </option>
              );
            })}
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            className="px-4 py-2 border rounded text-blue-600 hover:bg-blue-100"
          >
            Huỷ
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thêm User
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <span className="text-white text-lg">👥</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Quản lý thông tin người dùng hệ thống</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-blue-600">
                📥 Export
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ➕ Add User
              </button>
            </div>
          </div>
        </div>

        {/* Add User Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Add New User</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ❌
              </button>
            </div>
            <AddUserFormWithAutoUserId />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-xl">👥</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">With Bikes</p>
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter((u) => u.selectedBikeId && u.selectedBikeId !== "none").length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-xl">🚲</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Male Users</p>
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter((u) => normalizeGender(u.gender) === "male").length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-xl">👨</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Female Users</p>
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter((u) => normalizeGender(u.gender) === "female").length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-xl">👩</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔍</span>
              <h3 className="text-lg font-semibold text-gray-900">Search & Filters</h3>
            </div>
            <button
              onClick={clearSearch}
              className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              🔄 Clear
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Search User ID"
                value={search.userId}
                onChange={(e) => setSearch({ ...search, userId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Search Email"
                value={search.email}
                onChange={(e) => setSearch({ ...search, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Search Name"
                value={search.name}
                onChange={(e) => setSearch({ ...search, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Search Age"
                value={search.age}
                onChange={(e) => setSearch({ ...search, age: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                value={search.selectedBikeId}
                onChange={(e) => setSearch({ ...search, selectedBikeId: e.target.value })}
              >
                <option value="">All Bikes</option>
                <option value="none">None</option>
                {Array.from({ length: 9 }).map((_, i) => {
                  const bikeId = `bike${i + 1}`;
                  return (
                    <option key={bikeId} value={bikeId}>
                      {bikeId}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Users ({filteredUsers.length})</h3>
              <div className="text-sm text-gray-500">
                Showing {currentUsers.length} of {filteredUsers.length} filtered users (Page {currentPage} of {totalPages})
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bike Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-500">
                      No matching users found.
                    </td>
                  </tr>
                )}
                {currentUsers.map((user) =>
                  editingUserId === user.id ? (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      {/* Editable row */}
                      <td className="px-2 py-2">
                        <div className="text-gray-600 select-none">{user.userId}</div>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="email"
                          className="w-full border rounded px-2 py-1"
                          value={editedUser.email || ""}
                          onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                        />
                      </td>
                      <td className="px-2 py-2 space-y-1">
                        <div>
                          <label className="block text-xs font-medium text-gray-500">Age</label>
                          <input
                            type="number"
                            min={0}
                            className="w-full border rounded px-2 py-1"
                            value={editedUser.age || ""}
                            onChange={(e) => setEditedUser({ ...editedUser, age: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500">Gender</label>
                          <select
                            className="w-full border rounded px-2 py-1"
                            value={editedUser.gender || ""}
                            onChange={(e) => setEditedUser({ ...editedUser, gender: e.target.value })}
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <select
                          className="w-full border rounded px-2 py-1"
                          value={editedUser.selectedBikeId || "none"}
                          onChange={(e) => setEditedUser({ ...editedUser, selectedBikeId: e.target.value })}
                        >
                          <option value="none">Không có xe</option>
                          {Array.from({ length: 9 }).map((_, i) => {
                            const bikeId = `bike${i + 1}`;
                            return (
                              <option key={bikeId} value={bikeId}>
                                {bikeId}
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <button
                          onClick={saveUser}
                          className="text-blue-600 hover:underline mr-2"
                          title="Lưu"
                        >
                          💾
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-gray-600 hover:underline"
                          title="Huỷ"
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      {/* Normal row */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg mr-3">
                            <span className="text-blue-600">{getGenderIcon(user.gender)}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name || "N/A"}</div>
                            <div className="text-sm text-gray-500">ID: {user.userId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{user.email || "N/A"}</div>
                          <div className="text-sm text-gray-500">📧 Email</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-medium text-gray-900">{user.age || "N/A"}</span>
                          <span className="text-xs text-gray-500 capitalize">{user.gender || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getBikeStatus(user.selectedBikeId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View"
                            onClick={() => alert(`User Details:\n${JSON.stringify(user, null, 2)}`)}
                          >
                            👁️
                          </button>
                          <button
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit"
                            onClick={() => startEditing(user)}
                          >
                            ✏️
                          </button>
                          <button
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                            onClick={() => deleteUser(user)}
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
