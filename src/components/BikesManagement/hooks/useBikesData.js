import { useState, useEffect, useMemo } from "react";
import { db } from "../../../firebase";
import { ref, onValue, set, update, remove } from "firebase/database";

/**
 * Hook xử lý dữ liệu bike, locks, filter, phân trang
 * @param {boolean} authChecked
 */
export default function useBikesData(authChecked) {
  const [bikes, setBikes] = useState([]);
  const [locks, setLocks] = useState([]);

  const [filter, setFilter] = useState({
    bikeId: "",
    currentLockId: "",
    status: "",
    currentUserId: "",
  });

  const [editBikeId, setEditBikeId] = useState(null);
  const [editBikeData, setEditBikeData] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [newBike, setNewBike] = useState({
    bikeId: "",
    currentLockId: "",
    status: "locked",
    currentUserId: "",
  });

  // Load realtime data khi auth đã xác nhận
  useEffect(() => {
    if (!authChecked) return;

    const bikesRef = ref(db, "bikes");
    const unsubscribeBikes = onValue(bikesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const bikeList = Object.entries(data).map(([id, bike]) => ({ id, ...bike }));
        setBikes(bikeList);
      } else {
        setBikes([]);
      }
    });

    const locksRef = ref(db, "locks");
    const unsubscribeLocks = onValue(locksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lockList = Object.entries(data).map(([id, lock]) => ({ id, ...lock }));
        setLocks(lockList);
      } else {
        setLocks([]);
      }
    });

    return () => {
      unsubscribeBikes();
      unsubscribeLocks();
    };
  }, [authChecked]);

  // Reset trang khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Danh sách bikeId hiện có
  const currentBikeIds = useMemo(() => bikes.map((b) => b.bikeId), [bikes]);

  // Lock id được sử dụng trong bike
  const usedLockIds = useMemo(() => 
    bikes.map((bike) => bike.currentLockId).filter((lid) => lid && lid !== ""), [bikes]);

  // Tất cả lockId
  const allLockIds = useMemo(() => locks.map((lock) => lock.lockId).filter(Boolean), [locks]);

  // Lock còn trống
  const lockOptions = useMemo(() => 
    allLockIds.filter((lockId) => !usedLockIds.includes(lockId)), [allLockIds, usedLockIds]);

  // Filter bikes theo filter truyền
  const filteredBikes = useMemo(() => {
    return bikes.filter((bike) => {
      const matchBikeId = !filter.bikeId || bike.bikeId === filter.bikeId;
      const matchLockId = !filter.currentLockId || bike.currentLockId === filter.currentLockId;
      const matchStatus = !filter.status || bike.status === filter.status;

      const inputUser = (filter.currentUserId || "").trim().toLowerCase();
      const bikeUser = (bike.currentUserId || "").toLowerCase();
      const matchUser = inputUser === "" || bikeUser.includes(inputUser);

      return matchBikeId && matchLockId && matchStatus && matchUser;
    });
  }, [bikes, filter]);

  // Tổng số trang phân trang
  const totalPages = Math.ceil(filteredBikes.length / itemsPerPage);

  // Bike hiển thị trang hiện tại
  const currentBikes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBikes.slice(start, start + itemsPerPage);
  }, [filteredBikes, currentPage]);

  // Tạo bikeId mới không trùng
  const getMaxBikeNumber = (bikesList) => {
    let max = 0;
    bikesList.forEach(({ bikeId }) => {
      if (bikeId && bikeId.startsWith("bike")) {
        const num = parseInt(bikeId.slice(4), 10);
        if (!isNaN(num) && num > max) max = num;
      }
    });
    return max;
  };

  const createNewBikeId = () => {
    const maxNum = getMaxBikeNumber(bikes);
    let candidateId = `bike${maxNum + 1}`;
    if (!currentBikeIds.includes(candidateId)) return candidateId;

    let newNum = maxNum + 2;
    while (currentBikeIds.includes(`bike${newNum}`)) {
      newNum++;
    }
    return `bike${newNum}`;
  };

  // Reset form thêm bike mới
  const resetNewBikeForm = () => {
    setNewBike({
      bikeId: createNewBikeId(),
      currentLockId: "",
      status: "locked",
      currentUserId: "",
    });
  };

  const handleAddBike = () => {
    if (!newBike.bikeId) {
      alert("Bike ID chưa có!");
      return;
    }
    if (!newBike.currentLockId) {
      alert("Vui lòng chọn Lock ID.");
      return;
    }
    if (lockOptions.length === 0) {
      alert("Hết lock chưa có xe! Vui lòng thêm lock mới trước khi thêm bike.");
      return;
    }
    if (!lockOptions.includes(newBike.currentLockId)) {
      alert("Lock ID đã có xe khác sử dụng hoặc không tồn tại.");
      return;
    }
    if (currentBikeIds.includes(newBike.bikeId)) {
      alert(`Bike ID ${newBike.bikeId} đã tồn tại.`);
      return;
    }

    const bikeRef = ref(db, `bikes/${newBike.bikeId}`);
    set(bikeRef, newBike)
      .then(() => {
        resetNewBikeForm();
      })
      .catch((e) => alert("Error adding bike: " + e.message));
  };

  const handleEditClick = (bike) => {
    setEditBikeId(bike.id);
    setEditBikeData({ ...bike });
  };

  const handleCancelEdit = () => {
    setEditBikeId(null);
    setEditBikeData({});
  };

  const handleSaveEdit = () => {
    if (!editBikeId) return;
    const bikeRef = ref(db, `bikes/${editBikeId}`);
    update(bikeRef, editBikeData)
      .then(() => {
        setEditBikeId(null);
        setEditBikeData({});
      })
      .catch((e) => alert("Error updating bike: " + e.message));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa bike này?")) return;
    const bikeRef = ref(db, `bikes/${id}`);
    remove(bikeRef).catch((e) => alert("Error deleting bike: " + e.message));
  };

  const handleView = (bike) => {
    alert(`View bike:\nID: ${bike.bikeId}\nStatus: ${bike.status}\nLock: ${bike.currentLockId}\nUser: ${bike.currentUserId}`);
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Hiển thị trạng thái xe
  const getStatusBadge = (status) => {
    if (status === "locked") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Locked
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Unlocked
      </span>
    );
  };

  return {
    bikes,
    locks,
    filter,
    setFilter,
    filteredBikes,
    currentBikes,
    editBikeId,
    editBikeData,
    setEditBikeId,
    setEditBikeData,
    newBike,
    setNewBike,
    resetNewBikeForm,
    lockOptions,
    handleAddBike,
    handleEditClick,
    handleCancelEdit,
    handleSaveEdit,
    handleDelete,
    handleView,
    goToPage,
    totalPages,
    currentPage,
    getStatusBadge,
    allLockIds  };
}
