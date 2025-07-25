import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";

export default function Locks() {
  const [locks, setLocks] = useState([]);
  const [filter, setFilter] = useState({
    occupied: "",
    otpDate: "",
    isValid: "",
    returnBikeId: "",
  });

  useEffect(() => {
    const locksRef = ref(db, "locks");
    onValue(locksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lockList = Object.entries(data).map(([id, lock]) => ({
          id,
          ...lock,
        }));
        setLocks(lockList);
      } else {
        setLocks([]);
      }
    });
  }, []);

  const formatTime = (ts) => {
    if (!ts) return "-";
    const date = new Date(Number(ts));
    return date.toLocaleString();
  };

  // Lọc dữ liệu theo các tiêu chí
  const filteredLocks = locks.filter((l) => {
    const otpDate = l.otpTimestamp
      ? new Date(Number(l.otpTimestamp)).toISOString().split("T")[0]
      : "";

    return (
      (filter.occupied === "" || (filter.occupied === "yes" ? l.occupied : !l.occupied)) &&
      (filter.otpDate === "" || otpDate === filter.otpDate) &&
      (filter.isValid === "" || String(l.isValid) === filter.isValid) &&
      (filter.returnBikeId === "" ||
        l.returnBikeId?.toLowerCase().includes(filter.returnBikeId.toLowerCase()))
    );
  });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Lock Status</h1>

      {/* Bộ lọc */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
        <div>
          <label className="block mb-1">Occupied</label>
          <select
            className="w-full border rounded p-2"
            value={filter.occupied}
            onChange={(e) => setFilter({ ...filter, occupied: e.target.value })}
          >
            <option value="">Tất cả</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">OTP Time</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={filter.otpDate}
            onChange={(e) => setFilter({ ...filter, otpDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block mb-1">Valid</label>
          <select
            className="w-full border rounded p-2"
            value={filter.isValid}
            onChange={(e) => setFilter({ ...filter, isValid: e.target.value })}
          >
            <option value="">Tất cả</option>
            <option value="true">✔</option>
            <option value="false">✖</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Return ID</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            placeholder="Nhập returnBikeId"
            value={filter.returnBikeId}
            onChange={(e) => setFilter({ ...filter, returnBikeId: e.target.value })}
          />
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white shadow rounded p-4 overflow-x-auto">
        <table className="table-auto w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2">Lock ID</th>
              <th className="text-left p-2">Bike ID</th>
              <th className="text-left p-2">Occupied</th>
              <th className="text-left p-2">OTP</th>
              <th className="text-left p-2">OTP Time</th>
              <th className="text-left p-2">Valid</th>
              <th className="text-left p-2">Return ID</th>
            </tr>
          </thead>
          <tbody>
            {filteredLocks.map((l) => (
              <tr key={l.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{l.lockId || l.id}</td>
                <td className="p-2">{l.bikeId || "None"}</td>
                <td className="p-2">
                  {l.occupied ? (
                    <span className="text-green-600 font-semibold">Yes</span>
                  ) : (
                    <span className="text-gray-500">No</span>
                  )}
                </td>
                <td className="p-2">{l.otp || "-"}</td>
                <td className="p-2">{formatTime(l.otpTimestamp)}</td>
                <td className="p-2">
                  {l.isValid ? (
                    <span className="text-green-600 font-semibold">✔</span>
                  ) : (
                    <span className="text-red-500 font-semibold">✖</span>
                  )}
                </td>
                <td className="p-2">{l.returnBikeId || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLocks.length === 0 && (
          <p className="text-center mt-4 text-gray-500">Không có dữ liệu phù hợp.</p>
        )}
      </div>
    </div>
  );
}
