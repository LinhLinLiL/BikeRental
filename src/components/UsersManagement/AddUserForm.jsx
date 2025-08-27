import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from "../../firebase";

export default function AddUserForm({ onCancel }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",       // Thêm trường password
    name: "",
    age: "",
    gender: "",
    selectedBikeId: "",  // luôn là rỗng khi tạo mới
    role: "user",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      name: "",
      age: "",
      gender: "",
      selectedBikeId: "",
      role: "user",
    });
    setError("");
  };

  // Hàm tạo user mới trên Firebase Authentication và lưu vào Realtime Database
  const addNewUser = async (userData) => {
    try {
      // Tạo user mới qua Firebase Authentication với email & password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const uid = userCredential.user.uid;

      // Lưu thông tin user vào Realtime Database, uid làm key
      await set(ref(db, `users/${uid}`), {
        userId: uid,
        email: userData.email,
        name: userData.name,
        age: userData.age || "",
        gender: userData.gender || "",
        selectedBikeId: "", // mặc định rỗng
        role: userData.role || "user",
      });

      resetForm();
      alert("Tạo user thành công!");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    
    // Kiểm tra các trường bắt buộc
    if (!formData.email || !formData.password || !formData.name) {
      setError("Vui lòng nhập đầy đủ Email, Mật khẩu và Tên");
      return;
    }

    setIsLoading(true);
    addNewUser(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div>
        <label className="block text-gray-700 font-medium mb-1">Email</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-600"
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-1">Mật khẩu</label>
        <input
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-600"
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-1">Tên</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-600"
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-1">Tuổi</label>
        <input
          type="number"
          min={0}
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-600"
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-1">Giới tính</label>
        <select
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-600"
          disabled={isLoading}
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
          value=""
          className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
        >
          <option value="">Không có xe</option>
        </select>
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-1">Role</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-600"
          disabled={isLoading}
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
          disabled={isLoading}
        >
          Huỷ
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          disabled={isLoading}
        >
          {isLoading ? "Đang thêm ..." : "Thêm User"}
        </button>
      </div>
    </form>
  );
}
