// 📁 src/components/forms/AddBikeForm.jsx
import React, { useState } from "react";
import { ref, push } from "firebase/database";
import { db } from "../../firebase";

export default function AddBikeForm() {
  const [newBike, setNewBike] = useState({
    bikeId: "",
    status: "locked",
    currentLockId: "",
    currentUserId: "",
  });

  const handleAddBike = async () => {
    if (!newBike.bikeId) {
      alert("Bike ID là bắt buộc.");
      return;
    }

    const bikesRef = ref(db, "bikes");
    try {
      await push(bikesRef, {
        ...newBike,
        currentUserId: newBike.currentUserId || "",
        currentLockId: newBike.currentLockId || "",
      });
      setNewBike({ bikeId: "", status: "locked", currentLockId: "", currentUserId: "" });
    } catch (err) {
      console.error("Lỗi khi thêm bike:", err);
      alert("Thêm bike thất bại.");
    }
  };

  return (
    <div className="bg-gray-100 p-4 mb-4 rounded">
      <h2 className="font-semibold mb-2">➕ Thêm xe đạp mới</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <input className="border p-2 rounded" placeholder="Bike ID" value={newBike.bikeId} onChange={(e) => setNewBike({ ...newBike, bikeId: e.target.value })} />
        <select className="border p-2 rounded" value={newBike.status} onChange={(e) => setNewBike({ ...newBike, status: e.target.value })}>
          <option value="locked">locked</option>
          <option value="unlocked">unlocked</option>
          <option value="in_use">in_use</option>
        </select>
        <input className="border p-2 rounded" placeholder="Current Lock ID (tùy chọn)" value={newBike.currentLockId} onChange={(e) => setNewBike({ ...newBike, currentLockId: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Current User ID (tùy chọn)" value={newBike.currentUserId} onChange={(e) => setNewBike({ ...newBike, currentUserId: e.target.value })} />
      </div>
      <button onClick={handleAddBike} className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Thêm Bike
      </button>
    </div>
  );
}
