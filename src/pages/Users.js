// src/pages/Users.js
import React, { useState } from "react";
import { useUserData } from "../hooks/useUserData";
import { filterUsers } from "../utils/userUtils";

export default function Users() {
  const users = useUserData();
  const [search, setSearch] = useState({
    userId: "",
    email: "",
    name: "",
    age: "",
    gender: "",
    selectedBikeId: "",
  });

  const filteredUsers = filterUsers(users, search);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">User Management</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4 text-sm">
        <input className="border p-2 rounded" placeholder="Search User ID" value={search.userId} onChange={(e) => setSearch({ ...search, userId: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Search Email" value={search.email} onChange={(e) => setSearch({ ...search, email: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Search Name" value={search.name} onChange={(e) => setSearch({ ...search, name: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Search Age" value={search.age} onChange={(e) => setSearch({ ...search, age: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Search Gender" value={search.gender} onChange={(e) => setSearch({ ...search, gender: e.target.value })} />
        <select className="border p-2 rounded" value={search.selectedBikeId} onChange={(e) => setSearch({ ...search, selectedBikeId: e.target.value })}>
          <option value="">All Bikes</option>
          <option value="none">None</option>
          {Array.from({ length: 9 }, (_, i) => (
            <option key={i} value={`bike${i + 1}`}>
              bike{i + 1}
            </option>
          ))}
        </select>
      </div>
      <div className="bg-white shadow rounded p-4 overflow-x-auto">
        <table className="table-auto w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-left">
              <th className="p-2">User ID</th>
              <th className="p-2">Email</th>
              <th className="p-2">Name</th>
              <th className="p-2">Age</th>
              <th className="p-2">Gender</th>
              <th className="p-2">Selected Bike</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{u.userId}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.name || "-"}</td>
                <td className="p-2">{u.age || "-"}</td>
                <td className="p-2">{u.gender || "-"}</td>
                <td className="p-2">{u.selectedBikeId || "None"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && <p className="text-center mt-4 text-gray-500">No matching users found.</p>}
      </div>
    </div>
  );
}
