export default function TripCard({ trip, onDelete }) {
  return (
    <div className="border p-6 rounded-2xl shadow-lg bg-white mb-8">
      <h2 className="text-xl font-bold text-green-800 mb-2">
        {trip.start_date} - {trip.end_date}
      </h2>
      <p className="text-gray-600 mb-1">Interests: {trip.interests?.join(', ') || 'None'}</p>
      <p className="text-gray-600 mb-4">Preferences: {trip.preferences?.join(', ') || 'None'}</p>

      {trip.schedule.map((day, index) => (
        <div key={index} className="mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Day {day.day}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(day.pois) && day.pois.map((poi, idx) => (
              <div
                key={idx}
                className="rounded-xl border bg-white shadow-md overflow-hidden"
              >
                <img
                  src={poi.image_url || "/default.jpg"}
                  alt={poi.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h4 className="text-lg font-bold text-green-800 mb-1">
                    {poi.name}
                  </h4>
                  <a
                    href={poi.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 underline self-end mt-auto"
                  >
                    View on Map
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="text-right">
        <button
          onClick={() => onDelete(trip.id)}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete Trip
        </button>
      </div>
    </div>
  );
}

// export default function TripCard({ trip, onDelete }) {
//   return (
//     <div className="border p-4 rounded-lg shadow-md bg-white mb-4">
//       <h2 className="text-xl font-bold text-green-700">
//         {trip.start_date} - {trip.end_date}
//       </h2>
//       <p className="text-gray-600 mb-2">Interests: {trip.interests.join(', ')}</p>
//       <p className="text-gray-600 mb-4">Preferences: {trip.preferences.join(', ')}</p>

//       {/* 每日行程渲染 */}
//       {trip.schedule.map((day, index) => (
//         <div key={index} className="mb-2">
//           <h3 className="text-green-800 font-semibold">Day {index + 1}</h3>
//           <ul className="list-disc pl-5">
//             {day.map((poi, idx) => (
//               <li key={idx} className="mb-4">
//                 <img src={poi.image_url || "/default.jpg"} alt={poi.name} className="w-full h-40 object-cover rounded mb-2" />
//                 <p className="text-green-900 font-semibold">{poi.name}</p>
//                 <p className="text-sm text-gray-500">{poi.introduction}</p>
//               </li>
//             ))}
//           </ul>
//         </div>
//       ))}
        
//       <button
//         onClick={() => onDelete(trip.id)}
//         className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
//       >
//         Delete Trip
//       </button>
//     </div>
//   );
// }
