// import { useEffect, useState } from 'react';
// import axios from 'axios';

// const DetectPlate = () => {
//   const [logs, setLogs] = useState([]);

//   useEffect(() => {
//     axios.get('http://localhost:5000/logs')  // sửa nếu dùng IP khác
//       .then(res => setLogs(res.data))
//       .catch(err => console.error('Lỗi tải logs:', err));
//   }, []);

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">📋 Danh sách biển số đã nhận diện</h1>
//       <div className="grid md:grid-cols-2 gap-4">
//         {logs.map((log, idx) => (
//           <div key={idx} className="bg-white rounded-xl p-4 shadow">
//             <p className="font-medium">Thiết bị: <span className="text-blue-600">{log.device_id}</span></p>
//             <p>Ảnh gốc: {log.filename}</p>
//             <p>Thời gian: {log.timestamp}</p>
//             <p>
//               Biển số:{' '}
//               {log.plate_numbers.map((p, i) => (
//                 <span key={i} className="text-green-600 mr-2">
//                   {p.plate} ({p.conf})
//                 </span>
//               ))}
//             </p>
//             <p>Lock: {log.locks_with_bikes.join(', ')}</p>
//             <div className="mt-2">
//               <img
//                 src={`http://localhost:5000/images/${log.filename}`}
//                 alt="original"
//                 className="w-full rounded"
//               />
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default DetectPlate;
