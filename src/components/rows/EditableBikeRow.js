// 📁 src/components/rows/EditableBikeRow.jsx
import React, { useState } from "react";
import { ref, update, remove } from "firebase/database";
import { db } from "../../firebase";

export default function EditableBikeRow({ bike }) {
  const [editing, setEditing] = useState(false);
  const [editedBike, setEditedBike] = useState({ ...bike });

  const handleSave = async () => {
    try {
      const bikeRef = ref(db, `bikes/${bike.id}`);
      await update(bikeRef, editedBike);
      setEditing(false);
    } catch (err) {
      console.error("Lỗi khi cập nhật bike:", err);
      alert("Không thể cập nhật bike.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Xác nhận xoá xe đạp ${bike.bikeId}?`)) return;
    try {
      const bikeRef = ref(db, `bikes/${bike.id}`);
      await remove(bikeRef);
    } catch (err) {
      console.error("Lỗi khi xoá bike:", err);
      alert("Không thể xoá bike.");
    }
  };

  return (
    <tr className="border-t hover:bg-gray-50">
      {editing ? (
        <>
          <td className="p-2">
            <input className="border p-1 w-full" value={editedBike.bikeId} onChange={(e) => setEditedBike({ ...editedBike, bikeId: e.target.value })} />
          </td>
          <td className="p-2">
            <select className="border p-1 w-full" value={editedBike.status} onChange={(e) => setEditedBike({ ...editedBike, status: e.target.value })}>
              <option value="locked">locked</option>
              <option value="unlocked">unlocked</option>
              <option value="in_use">in_use</option>
            </select>
          </td>
          <td className="p-2">
            <input className="border p-1 w-full" value={editedBike.currentLockId || ""} onChange={(e) => setEditedBike({ ...editedBike, currentLockId: e.target.value })} />
          </td>
          <td className="p-2">
            <input className="border p-1 w-full" value={editedBike.currentUserId || ""} onChange={(e) => setEditedBike({ ...editedBike, currentUserId: e.target.value })} />
          </td>
          <td className="p-2 flex gap-2">
            <button onClick={handleSave} className="text-green-600 hover:underline text-sm">Lưu</button>
            <button onClick={() => setEditing(false)} className="text-gray-500 hover:underline text-sm">Huỷ</button>
          </td>
        </>
      ) : (
        <>
          <td className="p-2">{bike.bikeId || bike.id}</td>
          <td className="p-2">
            <span className={
              bike.status === "locked"
                ? "text-yellow-600 font-medium"
                : bike.status === "in_use"
                ? "text-red-600 font-semibold"
                : "text-green-600 font-medium"
            }>
              {bike.status}
            </span>
          </td>
          <td className="p-2">{bike.currentLockId || "None"}</td>
          <td className="p-2">{bike.currentUserId || "None"}</td>
          <td className="p-2 flex gap-2">
            <button onClick={() => setEditing(true)} className="text-blue-600 hover:underline text-sm">Sửa</button>
            <button onClick={handleDelete} className="text-red-600 hover:underline text-sm">Xoá</button>
          </td>
        </>
      )}
    
    </tr>
  );
}
