// 📁 src/components/rows/EditableUserRow.jsx
import React, { useState } from "react";
import { ref, update, remove } from "firebase/database";
import { db } from "../../firebase";

export default function EditableUserRow({ user }) {
  const [editing, setEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });

  const handleSave = async () => {
    try {
      const userRef = ref(db, `users/${user.id}`);
      await update(userRef, editedUser);
      setEditing(false);
    } catch (err) {
      console.error("Lỗi khi cập nhật user:", err);
      alert("Không thể cập nhật user.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Xác nhận xoá người dùng ${user.userId}?`)) return;
    try {
      const userRef = ref(db, `users/${user.id}`);
      await remove(userRef);
    } catch (err) {
      console.error("Lỗi khi xoá user:", err);
      alert("Không thể xoá user.");
    }
  };

  return (
    <tr className="border-t hover:bg-gray-50">
      {editing ? (
        <>
          <td className="p-2">
            <input className="border p-1 w-full" value={editedUser.userId} onChange={(e) => setEditedUser({ ...editedUser, userId: e.target.value })} />
          </td>
          <td className="p-2">
            <input className="border p-1 w-full" value={editedUser.email} onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })} />
          </td>
          <td className="p-2">
            <input className="border p-1 w-full" value={editedUser.name} onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })} />
          </td>
          <td className="p-2">
            <input className="border p-1 w-full" value={editedUser.age} onChange={(e) => setEditedUser({ ...editedUser, age: e.target.value })} />
          </td>
          <td className="p-2">
            <input className="border p-1 w-full" value={editedUser.gender} onChange={(e) => setEditedUser({ ...editedUser, gender: e.target.value })} />
          </td>
          <td className="p-2">
            <input className="border p-1 w-full" value={editedUser.selectedBikeId} onChange={(e) => setEditedUser({ ...editedUser, selectedBikeId: e.target.value })} />
          </td>
          <td className="p-2 flex gap-2">
            <button onClick={handleSave} className="text-green-600 hover:underline text-sm">Lưu</button>
            <button onClick={() => setEditing(false)} className="text-gray-500 hover:underline text-sm">Huỷ</button>
          </td>
        </>
      ) : (
        <>
          <td className="p-2">{user.userId}</td>
          <td className="p-2">{user.email}</td>
          <td className="p-2">{user.name || "-"}</td>
          <td className="p-2">{user.age || "-"}</td>
          <td className="p-2">{user.gender || "-"}</td>
          <td className="p-2">{user.selectedBikeId || "None"}</td>
          <td className="p-2 flex gap-2">
            <button onClick={() => setEditing(true)} className="text-blue-600 hover:underline text-sm">Sửa</button>
            <button onClick={handleDelete} className="text-red-600 hover:underline text-sm">Xoá</button>
          </td>
        </>
      )}
    </tr>
  );
}
