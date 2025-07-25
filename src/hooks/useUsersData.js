// src/hooks/useUserData.js
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

export const useUserData = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.entries(data).map(([id, user]) => ({ id, ...user }));
        setUsers(userList);
      } else {
        setUsers([]);
      }
    });
  }, []);

  return users;
};
