import { AlertTriangle, CheckCircle } from "lucide-react";

export default function UsersTable({
  users,
  bikes,
  editingUserId,
  editedUser,
  setEditedUser,
  setEditingUserId,
  saveUser,
  cancelEditing,
  deleteUser,
  normalizeGender,
  hasAdmin,
  currentPage,
  totalPages,
  goToPage,
}) {
  const getGenderIcon = (gender) => {
    if (gender?.toLowerCase() === "male") return "👨";
    if (gender?.toLowerCase() === "female") return "👩";
    return "👤";
  };

  const getBikeStatus = (bikeId) => {
    if (!bikeId || bikeId === "none") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          🚫 No Bike
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        🚲 {bikeId}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden">
      {/* Header bảng */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">Users ({users.length})</h3>
        <div className="text-sm text-gray-500">
          Showing {users.length} users (Page {currentPage} of {totalPages})
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Details</th>
              <th>Bike Status</th>
              {hasAdmin && <th>Role</th>}
              <th>Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 && (
              <tr>
                <td colSpan={hasAdmin ? 6 : 5} className="text-center py-12 text-gray-500">
                  No matching users found.
                </td>
              </tr>
            )}

            {users.map((user) => {
              if (editingUserId === user.id) {
                // Edit row
                return (
                  <tr key={`edit-${user.id}`} className="hover:bg-blue-50 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-700">{user.userId}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="email"
                        className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-600"
                        value={editedUser.email || ""}
                        onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                      />
                    </td>
                    <td className="px-3 py-2 space-y-2">
                      <input
                        type="number"
                        min={0}
                        placeholder="Age"
                        className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-600"
                        value={editedUser.age || ""}
                        onChange={(e) => setEditedUser({ ...editedUser, age: e.target.value })}
                      />
                      <select
                        className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-600"
                        value={editedUser.gender || ""}
                        onChange={(e) => setEditedUser({ ...editedUser, gender: e.target.value })}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <select
                        className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-600"
                        value={editedUser.selectedBikeId || "none"}
                        onChange={(e) => setEditedUser({ ...editedUser, selectedBikeId: e.target.value })}
                      >
                        <option value="none">No Bike</option>
                        {bikes.map((bikeId, i) => (
                          <option key={bikeId || i} value={bikeId}>
                            {bikeId}
                          </option>
                        ))}
                      </select>
                    </td>
                    {hasAdmin && (
                      <td className="px-3 py-2 whitespace-nowrap">
                        <select
                          className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-600"
                          value={editedUser.role || "user"}
                          onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    )}
                    <td className="px-3 py-2 whitespace-nowrap space-x-2">
                      <button
                        onClick={saveUser}
                        title="Save"
                        className="text-green-600 hover:text-green-800"
                        aria-label="Save user"
                      >
                        💾
                      </button>
                      <button
                        onClick={cancelEditing}
                        title="Cancel"
                        className="text-red-600 hover:text-red-800"
                        aria-label="Cancel editing"
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                );
              }

              // Normal row
              return (
                <tr key={`view-${user.id}`} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <span className="text-blue-600">{getGenderIcon(user.gender)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user.name || "N/A"}</p>
                      <p className="text-xs text-gray-500">ID: {user.userId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex flex-col space-y-1">
                    <span>{user.age || "N/A"}</span>
                    <span className="capitalize">{user.gender || "N/A"}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getBikeStatus(user.selectedBikeId)}</td>
                  {hasAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {user.role === "admin" ? (
                        <span className="inline-flex items-center space-x-1 text-red-600 font-semibold">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Admin</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-green-600 font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          <span>User</span>
                        </span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-3">
                    <button
                      className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                      title="View"
                      onClick={() => alert(`User Details:\n${JSON.stringify(user, null, 2)}`)}
                      aria-label="View user"
                    >
                      👁️
                    </button>
                    <button
                      className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                      title="Edit"
                      onClick={() => setEditingUserId(user.id)}
                      aria-label="Edit user"
                    >
                      ✏️
                    </button>
                    <button
                      className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                      title="Delete"
                      onClick={() => deleteUser(user)}
                      aria-label="Delete user"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex justify-center space-x-3">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-blue-50 transition"
          >
            &lt; Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={`px-4 py-2 rounded-lg border font-semibold transition ${
                currentPage === pageNum
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {pageNum}
            </button>
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-blue-50 transition"
          >
            Next &gt;
          </button>
        </div>
      )}
    </div>
  );
}
