import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

export const useLockData = () => {
  const [lockList, setLockList] = useState([]);

  useEffect(() => {
    const lockRef = ref(db, "locks");
    onValue(lockRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const locks = Object.entries(data).map(([id, item]) => ({
          id,
          ...item,
        }));
        setLockList(locks);
      } else {
        setLockList([]);
      }
    });
  }, []);

  return lockList;
};
