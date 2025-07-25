import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";

export default function Bikes() {
  const [bikes, setBikes] = useState([]);
  const [filter, setFilter] = useState({
    bikeId: "",
    currentLockId: "",
    status: "",
    currentUserId: "",
  });

  useEffect(() => {
    const bikesRef = ref(db, "bikes");
    onValue(bikesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const bikeList = Object.entries(data).map(([id, bike]) => ({
          id,
          ...bike,
        }));
        setBikes(bikeList);
      } else {
        setBikes([]);
      }
    });
  }, []);

  const filteredBikes = bikes.filter((bike) => {
    const matchBikeId = filter.bikeId === "" || bike.bikeId === filter.bikeId;
    const matchLockId = filter.currentLockId === "" || bike.currentLockId === filter.currentLockId;
    const matchStatus = filter.status === "" || bike.status === filter.status;

    const inputUser = filter.currentUserId.trim().toLowerCase();
    const bikeUser = (bike.currentUserId || "none").toLowerCase();
    const matchUser =
      inputUser === "" || bikeUser.includes(inputUser); // hỗ trợ tìm "none" hoặc một phần userId

    return matchBikeId && matchLockId && matchStatus && matchUser;
  });

  const bikeOptions = Array.from({ length: 9 }, (_, i) => `bike${i + 1}`);
  const lockOptions = Array.from({ length: 9 }, (_, i) => `lock${i + 1}`);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Bike Management</h1>

      {/* Bộ lọc */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
        <div>
          <label className="block mb-1">Bike ID</label>
          <select
            className="w-full border rounded p-2"
            value={filter.bikeId}
            onChange={(e) => setFilter({ ...filter, bikeId: e.target.value })}
          >
            <option value="">Tất cả</option>
            {bikeOptions.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Current Lock</label>
          <select
            className="w-full border rounded p-2"
            value={filter.currentLockId}
            onChange={(e) => setFilter({ ...filter, currentLockId: e.target.value })}
          >
            <option value="">Tất cả</option>
            {lockOptions.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Status</label>
          <select
            className="w-full border rounded p-2"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">Tất cả</option>
            <option value="locked">locked</option>
            <option value="unlocked">unlocked</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Current User (type "none" for no user)</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            placeholder="Search User ID or 'none'"
            value={filter.currentUserId}
            onChange={(e) => setFilter({ ...filter, currentUserId: e.target.value })}
          />
        </div>
      </div>

      {/* Bảng xe */}
      <div className="bg-white shadow rounded p-4 overflow-x-auto">
        <table className="table-auto w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-left">
              <th className="p-2">Bike ID</th>
              <th className="p-2">Status</th>
              <th className="p-2">Current Lock</th>
              <th className="p-2">Current User</th>
            </tr>
          </thead>
          <tbody>
            {filteredBikes.map((b) => (
              <tr key={b.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{b.bikeId || b.id}</td>
                <td className="p-2">
                  <span
                    className={
                      b.status === "locked"
                        ? "text-yellow-600 font-medium"
                        : b.status === "in_use"
                        ? "text-red-600 font-semibold"
                        : "text-green-600 font-medium"
                    }
                  >
                    {b.status}
                  </span>
                </td>
                <td className="p-2">{b.currentLockId || "None"}</td>
                <td className="p-2">{b.currentUserId || "None"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBikes.length === 0 && (
          <p className="text-center mt-4 text-gray-500">Không có dữ liệu phù hợp.</p>
        )}
      </div>
    </div>
  );
}
