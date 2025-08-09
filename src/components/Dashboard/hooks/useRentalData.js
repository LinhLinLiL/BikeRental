import { useState, useEffect, useMemo } from "react";
import { db } from "../../../firebase";

import { ref, onValue } from "firebase/database";

const itemsPerPage = 15;

// Format timestamp YYYY-MM-DD
const formatDateToYMD = (timestamp) => {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function useRentalData(authChecked, filter) {
  const [rentalList, setRentalList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Load rental history realtime after auth checked
  useEffect(() => {
    if (!authChecked) return;

    setIsLoading(true);
    const rentalRef = ref(db, "rentalHistory");
    const unsubscribe = onValue(
      rentalRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setRentalList([]);
          setIsLoading(false);
          return;
        }
        const rentals = Object.entries(data).map(([id, item]) => ({
          ...item,
          id,
        }));

        rentals.sort((a, b) => b.borrowTimestamp - a.borrowTimestamp);
        setRentalList(rentals);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error loading rentalHistory:", error);
        setRentalList([]);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authChecked]);

  // Filter rental records based on filter state
  const filteredRentals = useMemo(() => {
    return rentalList.filter((rental) => {
      const { returnType, userId, bikeId, stationId, borrowed, returned } =
        filter;

      const borrowedDate = formatDateToYMD(rental.borrowTimestamp);
      const returnedDate = rental.returnTimestamp
        ? formatDateToYMD(rental.returnTimestamp)
        : "";

      return (
        (returnType === "all" || rental.returnType === returnType) &&
        (!userId ||
          (rental.userId || "").toLowerCase().includes(userId.toLowerCase())) &&
        (!bikeId ||
          (rental.bikeId || "").toLowerCase().includes(bikeId.toLowerCase())) &&
        (!stationId ||
          (rental.stationId || "").toLowerCase().includes(stationId.toLowerCase())) &&
        (!borrowed || borrowedDate === borrowed) &&
        (!returned || returnedDate === returned)
      );
    });
  }, [rentalList, filter]);

  // Compute statistics from filtered list
  const stats = useMemo(() => {
    const totalRentals = filteredRentals.length;
    const completedRentals = filteredRentals.filter(
      (rental) => rental.returnTimestamp
    );
    const totalDuration = completedRentals.reduce(
      (sum, rental) => sum + (rental.duration || 0),
      0
    );
    const averageDuration =
      completedRentals.length > 0
        ? totalDuration / completedRentals.length
        : 0;
    const emergencyReturns = filteredRentals.filter(
      (rental) => rental.returnType === "emergency"
    ).length;
    const normalReturns = filteredRentals.filter(
      (rental) => rental.returnType === "normal"
    ).length;
    const rentalsPerUser = filteredRentals.reduce((acc, rental) => {
      if (rental.userId) {
        acc[rental.userId] = (acc[rental.userId] || 0) + 1;
      }
      return acc;
    }, {});
    const rentalsPerBike = filteredRentals.reduce((acc, rental) => {
      if (rental.bikeId) {
        acc[rental.bikeId] = (acc[rental.bikeId] || 0) + 1;
      }
      return acc;
    }, {});
    const rentalsPerStation = filteredRentals.reduce((acc, rental) => {
      if (rental.stationId) {
        acc[rental.stationId] = (acc[rental.stationId] || 0) + 1;
      }
      return acc;
    }, {});
    return {
      totalRentals,
      averageDuration,
      emergencyReturns,
      normalReturns,
      rentalsPerUser,
      rentalsPerBike,
      rentalsPerStation,
    };
  }, [filteredRentals]);

  // --- Total rentals per month + diffs ---
  const rentalsPerMonth = useMemo(() => {
    const counts = {};
    filteredRentals.forEach((rental) => {
      if (!rental.borrowTimestamp) return;
      const date = new Date(rental.borrowTimestamp);
      const ym = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      counts[ym] = (counts[ym] || 0) + 1;
    });

    // Compute diffs month to month
    const sortedMonths = Object.keys(counts).sort();
    const diffs = {};
    for (let i = 0; i < sortedMonths.length; i++) {
      const month = sortedMonths[i];
      if (i === 0) {
        diffs[month] = 0;
      } else {
        const prevMonth = sortedMonths[i - 1];
        diffs[month] = counts[month] - counts[prevMonth];
      }
    }

    return { counts, diffs };
  }, [filteredRentals]);

  const totalPages = Math.ceil(filteredRentals.length / itemsPerPage);

  return {
    rentalList,
    filteredRentals,
    stats,
    rentalsPerMonth,
    isLoading,
    currentPage,
    setCurrentPage,
    totalPages,
  };
}
