import React, { useState } from "react";
import { ref, update, remove } from "firebase/database";
import { db } from "../../firebase";

export default function EditableLockRow({ lock }) {
  const [editing, setEditing] = useState(false);
  const [editedLock, setEditedLock] = useState({ ...lock });

  const formatTime = (ts) => {
    if (!ts) return "-";
    const date = new Date(Number(ts));
    return date.toLocaleString();
  };

  const handleSave = async () => {
    try {
      const lockRef = ref(db, `locks/${lock.id}`);
      // Không update lockId và id để giữ nguyên khóa chính
      const { lockId, id, ...dataToSave } = editedLock;
      await update(lockRef, dataToSave);
      setEditing(false);
    } catch (err) {
      console.error("Lỗi khi cập nhật lock:", err);
      alert("Không thể cập nhật lock.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Xác nhận xoá khoá ${lock.lockId || lock.id}?`)) return;
    try {
      const lockRef = ref(db, `locks/${lock.id}`);
      await remove(lockRef);
    } catch (err) {
      console.error("Lỗi khi xoá lock:", err);
      alert("Không thể xoá lock.");
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      {editing ? (
        <>
          <td className="py-2 px-4">
            {/* lockId readonly */}
            <input 
              className="border p-1 w-full bg-gray-100 cursor-not-allowed" 
              value={editedLock.lockId || lock.id} 
              readOnly 
            />
          </td>
          <td className="py-2 px-4">
            <input
              className="border p-1 w-full"
              value={editedLock.bikeId || ""}
              onChange={(e) => setEditedLock({ ...editedLock, bikeId: e.target.value })}
            />
          </td>
          <td className="py-2 px-4">
            <select
              className="border p-1 w-full"
              value={editedLock.occupied}
              onChange={(e) => setEditedLock({ ...editedLock, occupied: e.target.value === "true" })}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </td>
          <td className="py-2 px-4">
            <input
              className="border p-1 w-full"
              value={editedLock.otp || ""}
              onChange={(e) => setEditedLock({ ...editedLock, otp: e.target.value })}
            />
          </td>
          <td className="py-2 px-4">{formatTime(editedLock.otpTimestamp)}</td>
          <td className="py-2 px-4">
            <select
              className="border p-1 w-full"
              value={editedLock.isValid}
              onChange={(e) => setEditedLock({ ...editedLock, isValid: e.target.value === "true" })}
            >
              <option value="true">✔</option>
              <option value="false">✖</option>
            </select>
          </td>
          <td className="py-2 px-4">
            <input
              className="border p-1 w-full"
              value={editedLock.returnBikeId || ""}
              onChange={(e) => setEditedLock({ ...editedLock, returnBikeId: e.target.value })}
            />
          </td>
          <td className="py-2 px-4 flex gap-2">
            <button onClick={handleSave} className="text-green-600 hover:underline text-sm">
              Lưu
            </button>
            <button onClick={() => setEditing(false)} className="text-gray-500 hover:underline text-sm">
              Huỷ
            </button>
          </td>
        </>
      ) : (
        <>
          <td className="py-2 px-4">{lock.lockId || lock.id}</td>
          <td className="py-2 px-4">{lock.bikeId || "None"}</td>
          <td className="py-2 px-4">
            {lock.occupied ? (
              <span className="text-green-600 font-semibold">Yes</span>
            ) : (
              <span className="text-gray-500">No</span>
            )}
          </td>
          <td className="py-2 px-4">{lock.otp || "-"}</td>
          <td className="py-2 px-4">{formatTime(lock.otpTimestamp)}</td>
          <td className="py-2 px-4">
            {lock.isValid ? (
              <span className="text-green-600 font-semibold">✔</span>
            ) : (
              <span className="text-red-500 font-semibold">✖</span>
            )}
          </td>
          <td className="py-2 px-4">{lock.returnBikeId || "-"}</td>
          <td className="py-2 px-4 flex gap-2">
            <button onClick={() => setEditing(true)} className="text-blue-600 hover:underline text-sm">
              Sửa
            </button>
            <button onClick={handleDelete} className="text-red-600 hover:underline text-sm">
              Xoá
            </button>
          </td>
        </>
      )}
    </tr>
  );
}
