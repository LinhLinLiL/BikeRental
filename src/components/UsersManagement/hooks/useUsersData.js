import { useState, useEffect, useMemo } from "react";
import { db } from "../../../firebase/config";
import { ref, onValue, update, remove } from "firebase/database";

export default function useUsersData(authChecked) {
  const [users, setUsers] = useState([]);
  const [bikes, setBikes] = useState([]);

  const [filter, setFilter] = useState({
    userId: "",
    email: "",
    name: "",
    age: "",
    gender: "",
    selectedBikeId: "",
    role: "",
  });

  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    if (!authChecked) return;

    const usersRef = ref(db, "users");
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, user]) => ({ id, ...user }));
        setUsers(list);
      } else {
        setUsers([]);
      }
    });

    const bikesRef = ref(db, "bikes");
    const unsubscribeBikes = onValue(bikesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, bike]) => bike.bikeId || key);
        setBikes(list);
      } else {
        setBikes([]);
      }
    });

    return () => {
      unsubscribeUsers();
      unsubscribeBikes();
    };
  }, [authChecked]);

  const normalizeGender = (g) => {
    if (!g) return "";
    const lower = g.toLowerCase();
    if (["male", "nam"].includes(lower)) return "male";
    if (["female", "nữ", "nu"].includes(lower)) return "female";
    return lower;
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      Object.keys(filter).every((key) => {
        const userValue = (u[key] || "").toString().toLowerCase();
        const searchValue = filter[key]?.toString().toLowerCase() || "";

        if (key === "gender") {
          if (!searchValue) return true;
          return normalizeGender(userValue) === normalizeGender(searchValue);
        }
        if (key === "selectedBikeId") {
          if (searchValue === "") return true;
          if (searchValue === "") return userValue === "";
          return userValue === searchValue;
        }
        if (key === "role") {
          if (!searchValue) return true;
          return userValue === searchValue;
        }
        return userValue.includes(searchValue);
      })
    );
  }, [users, filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const saveUser = async () => {
    if (!editedUser.id) return;
    try {
      const userRef = ref(db, `users/${editedUser.id}`);
      const dataToSave = {
        userId: editedUser.userId || "",
        email: editedUser.email || "",
        name: editedUser.name || "",
        age: editedUser.age || "",
        gender: editedUser.gender || "",
        selectedBikeId:
          !editedUser.selectedBikeId || editedUser.selectedBikeId === ""
            ? ""
            : editedUser.selectedBikeId,
        role: editedUser.role === "admin" ? "admin" : "user",
      };
      await update(userRef, dataToSave);
      setEditingUserId(null);
      setEditedUser({});
    } catch (err) {
      alert("Không thể cập nhật user.");
      console.error(err);
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Xác nhận xoá người dùng ${user.userId}?`)) return;
    try {
      const userRef = ref(db, `users/${user.id}`);
      await remove(userRef);
    } catch (err) {
      alert("Không thể xoá user.");
      console.error(err);
    }
  };

  const clearFilter = () => {
    setFilter({
      userId: "",
      email: "",
      name: "",
      age: "",
      gender: "",
      selectedBikeId: "",
      role: "",
    });
  };

  return {
    users,
    bikes,
    filter,
    setFilter,
    filteredUsers,
    currentUsers,
    editingUserId,
    setEditingUserId,
    editedUser,
    setEditedUser,
    currentPage,
    setCurrentPage,
    totalPages,
    saveUser,
    deleteUser,
    clearFilter,
    normalizeGender,
  };
}
