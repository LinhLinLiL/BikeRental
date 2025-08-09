import React, { useState } from "react";

export default function AddUserForm({ onSubmit, onCancel, users = [] }) {
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

  const [formData, setFormData] = useState({
    userId: generateRandomUserId(),
    email: "",
    name: "",
    age: "",
    gender: "",
    selectedBikeId: "none",
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.name) {
      alert("Vui lòng nhập đủ Email và Name");
      return;
    }
    onSubmit(formData);
    resetForm();
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
          onClick={() => {
            resetForm();
            onCancel();
          }}
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
}
