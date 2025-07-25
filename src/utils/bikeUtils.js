export const filterBikes = (bikes, filter) => {
  const inputUser = filter.currentUserId.trim().toLowerCase();

  return bikes.filter((bike) => {
    const matchBikeId = filter.bikeId === "" || bike.bikeId === filter.bikeId;
    const matchLockId = filter.currentLockId === "" || bike.currentLockId === filter.currentLockId;
    const matchStatus = filter.status === "" || bike.status === filter.status;

    const bikeUser = (bike.currentUserId || "none").toLowerCase();
    const matchUser = inputUser === "" || bikeUser.includes(inputUser); // hỗ trợ tìm none hoặc userId

    return matchBikeId && matchLockId && matchStatus && matchUser;
  });
};
