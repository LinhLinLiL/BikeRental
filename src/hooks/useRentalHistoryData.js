import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

export const useRentalHistoryData = () => {
  const [rentalList, setRentalList] = useState([]);

  useEffect(() => {
    const rentalRef = ref(db, "rentalHistory");
    onValue(rentalRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const rentals = Object.entries(data).map(([id, item]) => ({
          ...item,
          id,
        }));
        rentals.sort((a, b) => b.borrowTimestamp - a.borrowTimestamp);
        setRentalList(rentals);
      } else {
        setRentalList([]);
      }
    });
  }, []);

  return rentalList;
};
