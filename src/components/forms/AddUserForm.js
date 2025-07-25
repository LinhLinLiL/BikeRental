// 📁 src/components/forms/AddUserForm.jsx
import React, { useState } from "react";
import { ref, push } from "firebase/database";
import { db } from "../../firebase";

export default function AddUserForm() {
  const [newUser, setNewUser] = useState({
    userId: "",
    email: "",
    name: "",
    age: "",
    gender: "",
    selectedBikeId: "",
  });

  const handleAddUser = async () => {
    if (!newUser.userId || !newUser.email) {
      alert("User ID và Email là bắt buộc.");
      return;
    }

    const usersRef = ref(db, "users");
    try {
      await push(usersRef, {
        ...newUser,
        selectedBikeId: newUser.selectedBikeId || "",
      });
      setNewUser({ userId: "", email: "", name: "", age: "", gender: "", selectedBikeId: "" });
    } catch (err) {
      console.error("Lỗi khi thêm user:", err);
      alert("Thêm user thất bại.");
    }
  };

  return (
    <div className="bg-gray-100 p-4 mb-4 rounded">
      <h2 className="font-semibold mb-2">➕ Thêm người dùng mới</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        <input className="border p-2 rounded" placeholder="User ID" value={newUser.userId} onChange={(e) => setNewUser({ ...newUser, userId: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Age" value={newUser.age} onChange={(e) => setNewUser({ ...newUser, age: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Gender" value={newUser.gender} onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Selected Bike ID (tùy chọn)" value={newUser.selectedBikeId} onChange={(e) => setNewUser({ ...newUser, selectedBikeId: e.target.value })} />
      </div>
      <button onClick={handleAddUser} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Thêm User
      </button>
    </div>
  );
}
