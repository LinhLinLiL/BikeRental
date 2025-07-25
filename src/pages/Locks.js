import React, { useState } from "react";
import { useLockData } from "../hooks/useLockData";
import { filterLockData } from "../utils/lockUtils";

export default function Locks() {
  const locks = useLockData();
  const [query, setQuery] = useState("");

  const filteredLocks = filterLockData(locks, query);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Lock Management</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm theo Lock ID hoặc Bike ID"
          className="w-full border rounded p-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-700">
              <th className="py-2 px-4">Lock ID</th>
              <th className="py-2 px-4">Bike ID</th>
              <th className="py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLocks.map((lock) => (
              <tr key={lock.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{lock.id}</td>
                <td className="py-2 px-4">{lock.bikeId || "-"}</td>
                <td className="py-2 px-4">
                  {lock.isLocked ? (
                    <span className="text-red-600">Locked</span>
                  ) : (
                    <span className="text-green-600">Unlocked</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLocks.length === 0 && (
          <p className="text-center text-gray-500 mt-4">Không có dữ liệu phù hợp.</p>
        )}
      </div>
    </div>
  );
}
