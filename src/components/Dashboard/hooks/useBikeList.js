import { useState, useEffect } from "react";
import { db } from "../../../firebase";

import { ref, onValue } from "firebase/database";

export default function useBikeList() {
  const [bikeList, setBikeList] = useState([]);

  useEffect(() => {
    const bikeRef = ref(db, "bikes");
    const unsubscribe = onValue(bikeRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setBikeList([]);
        return;
      }
      setBikeList(Object.keys(data));
    });

    return () => unsubscribe();
  }, []);

  return bikeList;
}
