import { useState, useEffect, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../../firebase";

export default function useStationStats() {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    const statisticsRef = ref(db, "statistics");
    const unsubscribe = onValue(statisticsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data).map((item) => ({
          stationId: item.stationId || "",
          rentals: item.rentals || 0,
          returns: item.returns || 0,
          emergencyReturns: item.emergencyReturns || 0,
        }));
        setStations(list);
      } else {
        setStations([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const totalRentals = useMemo(() => stations.reduce((sum, s) => sum + s.rentals, 0), [stations]);
  const totalReturns = useMemo(() => stations.reduce((sum, s) => sum + s.returns, 0), [stations]);
  const totalEmergencies = useMemo(() => stations.reduce((sum, s) => sum + s.emergencyReturns, 0), [stations]);
  const utilizationRate = useMemo(() => {
    const denom = totalRentals + totalReturns;
    return denom > 0 ? ((totalReturns / denom) * 100).toFixed(1) : 0;
  }, [totalRentals, totalReturns]);

  return {
    stations,
    totalRentals,
    totalReturns,
    totalEmergencies,
    utilizationRate,
  };
}
