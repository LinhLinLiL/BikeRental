// hooks/useBikesData.js
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { ref, onValue } from "firebase/database";

export const useBikesData = () => {
  const [bikes, setBikes] = useState([]);
  useEffect(() => {
    const bikesRef = ref(db, "bikes");
    onValue(bikesRef, (snapshot) => {
      const data = snapshot.val();
      const bikeList = data
        ? Object.entries(data).map(([id, bike]) => ({ id, ...bike }))
        : [];
      setBikes(bikeList);
    });
  }, []);
  return bikes;
};
