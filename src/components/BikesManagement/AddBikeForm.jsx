import {  XCircle } from "lucide-react";

export default function AddBikeForm({ newBike, setNewBike, lockOptions, onAddBike, onCancel }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Add New Bike</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close add form"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bike ID</label>
          <input
            type="text"
            value={newBike.bikeId}
            readOnly
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Lock ID</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            value={newBike.currentLockId}
            onChange={(e) => setNewBike({ ...newBike, currentLockId: e.target.value })}
          >
            <option value="">Select Lock ID</option>
            {lockOptions.length > 0 ? (
              lockOptions.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))
            ) : (
              <option disabled>-- Hết lock chưa có xe --</option>
            )}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={onAddBike}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Bike
          </button>
        </div>
      </div>
    </div>
  );
}
