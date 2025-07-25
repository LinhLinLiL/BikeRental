import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

export const useBikeData = () => {
  const [bikes, setBikes] = useState([]);

  useEffect(() => {
    const bikesRef = ref(db, "bikes");
    onValue(bikesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const bikeList = Object.entries(data).map(([id, bike]) => ({ id, ...bike }));
        setBikes(bikeList);
      } else {
        setBikes([]);
      }
    });
  }, []);

  return bikes;
};
