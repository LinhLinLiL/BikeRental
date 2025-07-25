// 📁 src/components/forms/AddLockForm.jsx
import React, { useState } from "react";
import { ref, push } from "firebase/database";
import { db } from "../../firebase";

export default function AddLockForm() {
  const [newLock, setNewLock] = useState({
    id: "",
    bikeId: "",
    isLocked: true,
  });

  const handleAddLock = async () => {
    if (!newLock.id) {
      alert("Lock ID là bắt buộc.");
      return;
    }

    const locksRef = ref(db, "locks");
    try {
      await push(locksRef, {
        id: newLock.id,
        bikeId: newLock.bikeId || "",
        isLocked: newLock.isLocked,
      });
      setNewLock({ id: "", bikeId: "", isLocked: true });
    } catch (err) {
      console.error("Lỗi khi thêm lock:", err);
      alert("Thêm lock thất bại.");
    }
  };

  return (
    <div className="bg-gray-100 p-4 mb-4 rounded">
      <h2 className="font-semibold mb-2">➕ Thêm khóa mới</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        <input className="border p-2 rounded" placeholder="Lock ID" value={newLock.id} onChange={(e) => setNewLock({ ...newLock, id: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Bike ID (tùy chọn)" value={newLock.bikeId} onChange={(e) => setNewLock({ ...newLock, bikeId: e.target.value })} />
        <select className="border p-2 rounded" value={newLock.isLocked} onChange={(e) => setNewLock({ ...newLock, isLocked: e.target.value === "true" })}>
          <option value="true">Locked</option>
          <option value="false">Unlocked</option>
        </select>
      </div>
      <button onClick={handleAddLock} className="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
        Thêm Lock
      </button>
    </div>
  );
}
