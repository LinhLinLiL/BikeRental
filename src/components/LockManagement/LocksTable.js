// import { XCircle, CheckCircle } from "lucide-react";

const LocksTable = ({
  locks,
  currentPage,
  totalPages,
  goToPage,
  editLockId,
  setEditLockId,
  editLockData,
  setEditLockData,
  getStatusBadge,
  handleDelete,
  handleView,
  handleEditClick,
  handleCancelEdit,
  handleSaveEdit,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Locks ({locks.length})</h3>
          <div className="text-sm text-gray-500">
            Showing {locks.length} locks (Page {currentPage} of {totalPages})
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lock ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bike ID</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Is Valid</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Occupied</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OTP</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OTP Time</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Bike ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {locks.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-gray-500">
                  No matching locks found
                </td>
              </tr>
            ) : (
              locks.map((lock) =>
                editLockId === lock.id ? (
                  <tr key={lock.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap">{lock.lockId}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{getStatusBadge(lock)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="text"
                        value={editLockData.bikeId || ""}
                        onChange={(e) => setEditLockData({ ...editLockData, bikeId: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={!!editLockData.isValid}
                        onChange={(e) => setEditLockData({ ...editLockData, isValid: e.target.checked })}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={!!editLockData.occupied}
                        onChange={(e) => setEditLockData({ ...editLockData, occupied: e.target.checked })}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="text"
                        value={editLockData.otp || ""}
                        onChange={(e) => setEditLockData({ ...editLockData, otp: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="number"
                        value={editLockData.otpTimestamp || 0}
                        onChange={(e) => setEditLockData({ ...editLockData, otpTimestamp: Number(e.target.value) })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="text"
                        value={editLockData.returnBikeId || ""}
                        onChange={(e) => setEditLockData({ ...editLockData, returnBikeId: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button onClick={handleSaveEdit} className="text-blue-600 hover:underline mr-2" title="Save">
                        💾
                      </button>
                      <button onClick={handleCancelEdit} className="text-gray-600 hover:underline" title="Cancel">
                        ❌
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={lock.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap">{lock.lockId}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{getStatusBadge(lock)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{lock.bikeId || "-"}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">{lock.isValid ? "Yes" : "No"}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">{lock.occupied ? "Yes" : "No"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{lock.otp || "-"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {lock.otpTimestamp ? new Date(lock.otpTimestamp).toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{lock.returnBikeId || "-"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(lock)}
                          className="text-blue-600 hover:bg-blue-100 p-1 rounded"
                          title="View"
                        >
                          👁️
                        </button>
                    
                        <button
                          onClick={() => handleEditClick(lock)}
                          className="text-green-600 hover:bg-green-100 p-1 rounded"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(lock.id)}
                          className="text-red-600 hover:bg-red-100 p-1 rounded"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
};

export default LocksTable;
