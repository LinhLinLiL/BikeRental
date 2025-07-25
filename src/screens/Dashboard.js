import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";

const Dashboard = () => {
  const [rentalList, setRentalList] = useState([]);
  const [filter, setFilter] = useState({
    returnType: "all",
    userId: "",
    bikeId: "",
    stationId: "",
    borrowed: "",
    returned: "",
  });

  useEffect(() => {
    const rentalRef = ref(db, "rentalHistory");
    onValue(rentalRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const rentals = Object.entries(data).map(([id, item]) => ({
        ...item,
        id,
      }));

      rentals.sort((a, b) => b.borrowTimestamp - a.borrowTimestamp);
      setRentalList(rentals);
    });
  }, []);

  // Lọc dữ liệu theo tất cả filter
  const filteredRentals = rentalList.filter((rental) => {
    const {
      returnType,
      userId,
      bikeId,
      stationId,
      borrowed,
      returned,
    } = filter;

    const borrowedDate = new Date(rental.borrowTimestamp)
      .toLocaleDateString()
      .toLowerCase();
    const returnedDate = rental.returnTimestamp
      ? new Date(rental.returnTimestamp).toLocaleDateString().toLowerCase()
      : "";

    return (
      (returnType === "all" || rental.returnType === returnType) &&
      rental.userId.toLowerCase().includes(userId.toLowerCase()) &&
      rental.bikeId.toLowerCase().includes(bikeId.toLowerCase()) &&
      rental.stationId.toLowerCase().includes(stationId.toLowerCase()) &&
      borrowedDate.includes(borrowed.toLowerCase()) &&
      returnedDate.includes(returned.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Rental History</h2>

      {/* Bộ lọc */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm mb-4">
        <div>
          <label>Return Type</label>
          <select
            className="w-full border rounded p-2"
            value={filter.returnType}
            onChange={(e) => setFilter({ ...filter, returnType: e.target.value })}
          >
            <option value="all">Tất cả</option>
            <option value="normal">Bình thường</option>
            <option value="emergency">Khẩn cấp</option>
          </select>
        </div>
        <div>
          <label>User ID</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            placeholder="Nhập ID"
            value={filter.userId}
            onChange={(e) => setFilter({ ...filter, userId: e.target.value })}
          />
        </div>
        <div>
          <label>Bike ID</label>
          <select
            className="w-full border rounded p-2"
            value={filter.bikeId}
            onChange={(e) => setFilter({ ...filter, bikeId: e.target.value })}
          >
            <option value="">Tất cả</option>
            {Array.from({ length: 9 }, (_, i) => `bike${i + 1}`).map((bike) => (
              <option key={bike} value={bike}>
                {bike}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Station</label>
          <select
            className="w-full border rounded p-2"
            value={filter.stationId}
            onChange={(e) => setFilter({ ...filter, stationId: e.target.value })}
          >
            <option value="">Tất cả</option>
            <option value="station1">station1</option>
            <option value="station2">station2</option>
          </select>
        </div>

        <div>
          <label>Borrowed Date</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={filter.borrowed}
            onChange={(e) => setFilter({ ...filter, borrowed: e.target.value })}
          />
        </div>

        <div>
          <label>Returned Date</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={filter.returned}
            onChange={(e) => setFilter({ ...filter, returned: e.target.value })}
          />
        </div>

      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white p-6 rounded-lg shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-700">
              <th className="py-2 px-4">User ID</th>
              <th className="py-2 px-4">Bike ID</th>
              <th className="py-2 px-4">Station</th>
              <th className="py-2 px-4">Borrowed</th>
              <th className="py-2 px-4">Returned</th>
              <th className="py-2 px-4">Duration (s)</th>
              <th className="py-2 px-4">Return Type</th>
            </tr>
          </thead>
          <tbody>
            {filteredRentals.map((rental) => (
              <tr key={rental.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{rental.userId?.slice(0, 8)}...</td>
                <td className="py-2 px-4">{rental.bikeId}</td>
                <td className="py-2 px-4">{rental.stationId}</td>
                <td className="py-2 px-4">
                  {new Date(rental.borrowTimestamp).toLocaleString()}
                </td>
                <td className="py-2 px-4">
                  {rental.returnTimestamp
                    ? new Date(rental.returnTimestamp).toLocaleString()
                    : "-"}
                </td>
                <td className="py-2 px-4">{Math.floor(rental.duration / 1000)}</td>
                <td className="py-2 px-4">
                  {rental.returnType || <span className="italic text-gray-400">-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRentals.length === 0 && (
          <p className="text-center mt-4 text-gray-500">Không có dữ liệu phù hợp.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
