export default function StatCard({ title, value, icon, bg }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`${bg} p-3 rounded-lg`}>{icon}</div>
    </div>
  );
}
