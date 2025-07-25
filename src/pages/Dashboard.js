export const filterRentalData = (rentals, filter) => {
  return rentals.filter((rental) => {
    const {
      returnType,
      userId,
      bikeId,
      stationId,
      borrowed,
      returned,
    } = filter;

    const borrowedDate = new Date(rental.borrowTimestamp)
      .toLocaleDateString()
      .toLowerCase();
    const returnedDate = rental.returnTimestamp
      ? new Date(rental.returnTimestamp).toLocaleDateString().toLowerCase()
      : "";

    return (
      (returnType === "all" || rental.returnType === returnType) &&
      rental.userId.toLowerCase().includes(userId.toLowerCase()) &&
      rental.bikeId.toLowerCase().includes(bikeId.toLowerCase()) &&
      rental.stationId.toLowerCase().includes(stationId.toLowerCase()) &&
      borrowedDate.includes(borrowed.toLowerCase()) &&
      returnedDate.includes(returned.toLowerCase())
    );
  });
};
