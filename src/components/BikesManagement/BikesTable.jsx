import { Lock, User, Bike } from "lucide-react";

export default function BikesTable({
  bikes,
  editBikeId,
  editBikeData,
  setEditBikeData,
  handleEditClick,
  handleSaveEdit,
  handleCancelEdit,
  handleDelete,
  handleView,
  getStatusBadge,
  currentPage,
  totalPages,
  goToPage,
  lockOptions,
  getGenderIcon,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Bikes ({bikes.length})</h3>
        <div className="text-sm text-gray-500">
          Showing page {currentPage} of {totalPages}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bike</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Lock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bikes.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  <Bike className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  No matching bikes found
                  <br />
                  <span className="text-gray-400 text-sm">Try adjusting filters to see more results</span>
                </td>
              </tr>
            ) : (
              bikes.map((bike) =>
                editBikeId === bike.id ? (
                  <tr key={bike.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 py-2">{bike.bikeId}</td>
                    <td className="px-2 py-2">
                      <select
                        className="w-full border rounded px-2 py-1"
                        value={editBikeData.status}
                        onChange={(e) => setEditBikeData({ ...editBikeData, status: e.target.value })}
                      >
                        <option value="locked">Locked</option>
                        <option value="unlocked">Unlocked</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <select
                        className="w-full border rounded px-2 py-1"
                        value={editBikeData.currentLockId}
                        onChange={(e) => setEditBikeData({ ...editBikeData, currentLockId: e.target.value })}
                      >
                        <option value="">None</option>
                        {lockOptions.map((id) => (
                          <option key={id} value={id}>
                            {id}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        className="w-full border rounded px-2 py-1"
                        value={editBikeData.currentUserId}
                        onChange={(e) => setEditBikeData({ ...editBikeData, currentUserId: e.target.value })}
                      />
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <button onClick={handleSaveEdit} className="text-blue-600 hover:underline mr-2" title="Save">
                        💾
                      </button>
                      <button onClick={handleCancelEdit} className="text-gray-600 hover:underline" title="Cancel">
                        ❌
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={bike.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg mr-3">
                          <span className="text-purple-600">{getGenderIcon(bike.gender)}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{bike.name || "N/A"}</div>
                          <div className="text-sm text-gray-500">ID: {bike.bikeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(bike.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Lock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{bike.currentLockId || "None"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span
                          className={`text-sm ${
                            bike.currentUserId === "none" ? "text-gray-500 italic" : "text-gray-900"
                          }`}
                        >
                          {bike.currentUserId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => handleView(bike)} title="View" className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg">
                        👁️
                      </button>
                      <button onClick={() => handleEditClick(bike)} title="Edit" className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(bike.id)} title="Delete" className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 flex justify-center space-x-3">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            {"<"} Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={`px-3 py-1 rounded border ${
                currentPage === pageNum
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            Next {">"}
          </button>
        </div>
      )}
    </div>
  );
}
