export default function TripCard({ trip, onDelete }) {
  return (
    <div className="border p-4 rounded-lg shadow-md bg-white mb-4">
      <h2 className="text-xl font-bold text-green-700">
        {trip.start_date} - {trip.end_date}
      </h2>
      <p className="text-gray-600 mb-2">Interests: {trip.interests.join(', ')}</p>
      <p className="text-gray-600 mb-4">Preferences: {trip.preferences.join(', ')}</p>

      {/* 每日行程渲染 */}
      {trip.schedule.map((day, index) => (
        <div key={index} className="mb-2">
          <h3 className="text-green-800 font-semibold">Day {index + 1}</h3>
          <ul className="list-disc pl-5">
            {day.map((poi, idx) => (
              <li key={idx}>{poi.name} - {poi.area}</li>
            ))}
          </ul>
        </div>
      ))}

      <button
        onClick={() => onDelete(trip.id)}
        className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
      >
        Delete Trip
      </button>
    </div>
  );
}

// export default function TripCard({ trip, onDelete }) {
//   return (
//     <div className="border p-4 rounded-lg shadow-md bg-white mb-4">
//       <h2 className="text-xl font-bold text-green-700">{trip.start_date} - {trip.end_date}</h2>
//       <p className="text-gray-600 mb-2">Interests: {trip.interests.join(', ')}</p>
//       <p className="text-gray-600 mb-4">Preferences: {trip.preferences.join(', ')}</p>

//       {trip.schedule.map((day, index) => (
//         <div key={index} className="mb-2">
//           <h3 className="text-green-800 font-semibold">Day {index + 1}</h3>
//           <ul className="list-disc pl-5">
//             {day.map((poi, idx) => (
//               <li key={idx}>{poi.name} - {poi.area}</li>
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