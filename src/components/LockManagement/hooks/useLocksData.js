import { useState, useEffect, useMemo } from "react";
import { db } from "../../../firebase/config"; // điều chỉnh đường dẫn cho đúng
import { ref, onValue, set, update, remove } from "firebase/database";
import { XCircle, CheckCircle } from "lucide-react";

const itemsPerPage = 15;

export default function useLocksData(authChecked, filter, setFilter) {
  const [locks, setLocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Thêm / sửa trạng thái
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLock, setNewLock] = useState({
    lockId: "",
    status: "Khóa Mở",
    bikeId: "",
    isValid: false,
    occupied: false,
    otp: "",
    otpTimestamp: 0,
    returnBikeId: "",
  });

  const [editLockId, setEditLockId] = useState(null);
  const [editLockData, setEditLockData] = useState({});

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);

  // Load khóa realtime khi authChecked
  useEffect(() => {
    if (!authChecked) return;

    setIsLoading(true);
    const locksRef = ref(db, "locks");
    const unsubscribe = onValue(locksRef, (snapshot) => {
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
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [authChecked]);

  // Tạo ID mới tự động tăng
  const currentLockIds = useMemo(() => locks.map((l) => l.lockId), [locks]);

  const getMaxLockNumber = (locksList) => {
    let max = 0;
    locksList.forEach(({ lockId }) => {
      if (lockId && lockId.startsWith("lock")) {
        const num = parseInt(lockId.slice(4), 10);
        if (!isNaN(num) && num > max) max = num;
      }
    });
    return max;
  };

  const createNewLockId = () => {
    const maxNum = getMaxLockNumber(locks);
    let candidate = `lock${maxNum + 1}`;
    if (!currentLockIds.includes(candidate)) return candidate;
    let newNum = maxNum + 2;
    while (currentLockIds.includes(`lock${newNum}`)) {
      newNum++;
    }
    return `lock${newNum}`;
  };

  const resetNewLockForm = () => {
    setNewLock({
      lockId: createNewLockId(),
      status: "Khóa Mở",
      bikeId: "",
      isValid: false,
      occupied: false,
      otp: "",
      otpTimestamp: 0,
      returnBikeId: "",
    });
  };

  // Lọc khóa theo bộ lọc
  const filteredLocks = useMemo(() => {
    return locks.filter((lock) => {
      const matchLockId = filter.lockId === "" || lock.lockId === filter.lockId;

      const lockStatus =
        lock.isValid && lock.occupied ? "Có Xe, Khóa Đóng" : "Khóa Mở";

      const matchStatus = filter.status === "" || lockStatus === filter.status;

      const inputBikeId = filter.bikeId.trim().toLowerCase();
      const bikeIdInLock = (lock.bikeId || "").toLowerCase();
      const matchBikeId = inputBikeId === "" || bikeIdInLock.includes(inputBikeId);

      return matchLockId && matchStatus && matchBikeId;
    });
  }, [locks, filter]);

  const totalPages = Math.ceil(filteredLocks.length / itemsPerPage);

  const currentLocks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLocks.slice(start, start + itemsPerPage);
  }, [filteredLocks, currentPage]);

  // Badge trạng thái
  const getStatusBadge = (lock) => {
    if (lock.isValid && lock.occupied) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Có Xe, Khóa Đóng
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Khóa Mở
      </span>
    );
  };

  // Các hàm hành động thêm/sửa/xóa
  const handleAddLock = () => {
    if (!newLock.lockId) {
      alert("Lock ID chưa có!");
      return;
    }
    if (currentLockIds.includes(newLock.lockId)) {
      alert(`Lock ID ${newLock.lockId} đã tồn tại.`);
      return;
    }

    const lockToAdd = {
      lockId: newLock.lockId,
      status: "Khóa Mở",
      bikeId: "",
      isValid: false,
      occupied: false,
      otp: "",
      otpTimestamp: 0,
      returnBikeId: "",
    };

    const lockRef = ref(db, `locks/${newLock.lockId}`);
    set(lockRef, lockToAdd)
      .then(() => {
        setShowAddForm(false);
        resetNewLockForm();
      })
      .catch((e) => alert("Lỗi khi thêm khóa: " + e.message));
  };

  const handleEditClick = (lock) => {
    setEditLockId(lock.id);
    setEditLockData({ ...lock });
  };

  const handleCancelEdit = () => {
    setEditLockId(null);
    setEditLockData({});
  };

  const handleSaveEdit = () => {
    if (!editLockId) return;

    const status =
      editLockData.isValid && editLockData.occupied
        ? "Có Xe, Khóa Đóng"
        : "Khóa Mở";

    const lockRef = ref(db, `locks/${editLockId}`);
    update(lockRef, { ...editLockData, status })
      .then(() => {
        setEditLockId(null);
        setEditLockData({});
      })
      .catch((e) => alert("Lỗi khi cập nhật khóa: " + e.message));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa khóa này?")) return;
    const lockRef = ref(db, `locks/${id}`);
    remove(lockRef).catch((e) => alert("Lỗi khi xóa khóa: " + e.message));
  };

  const handleView = (lock) => {
    alert(`Chi tiết khóa:
ID: ${lock.lockId}
Trạng thái: ${lock.isValid && lock.occupied ? "Có Xe, Khóa Đóng" : "Khóa Mở"}
Bike ID: ${lock.bikeId || "-"}
Is Valid: ${lock.isValid ? "Yes" : "No"}
Occupied: ${lock.occupied ? "Yes" : "No"}
OTP: ${lock.otp || "-"}
OTP Timestamp: ${lock.otpTimestamp ? new Date(lock.otpTimestamp).toLocaleString() : "-"}
Return Bike ID: ${lock.returnBikeId || "-"}`);
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setFilter({ lockId: "", status: "", bikeId: "" });
  };

  return {
    locks,
    filteredLocks: currentLocks,
    isLoading,
    currentPage,
    setCurrentPage,
    totalPages,
    editLockId,
    setEditLockId,
    editLockData,
    setEditLockData,
    newLock,
    setNewLock,
    showAddForm,
    setShowAddForm,
    createNewLockId,
    handleAddLock,
    handleDelete,
    handleView,
    handleEditClick,
    handleCancelEdit,
    handleSaveEdit,
    getStatusBadge,
    goToPage,
    clearFilters,
  };
}
