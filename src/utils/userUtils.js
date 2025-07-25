// src/utils/userUtils.js
export const filterUsers = (users, search) => {
  return users.filter((u) =>
    Object.keys(search).every((key) => {
      const userValue = (u[key] || "").toString().toLowerCase();
      const searchValue = search[key].toLowerCase();
      return key === "selectedBikeId"
        ? searchValue === ""
          ? true
          : searchValue === "none"
          ? userValue === "" || userValue === "none"
          : userValue === searchValue
        : userValue.includes(searchValue);
    })
  );
};