export const filterLockData = (locks, query) => {
  return locks.filter(
    (lock) =>
      lock.id.toLowerCase().includes(query.toLowerCase()) ||
      lock.bikeId?.toLowerCase().includes(query.toLowerCase())
  );
};
