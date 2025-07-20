export default function POICard({ poi }) {
  return (
    <div className="rounded-lg shadow-md p-4 border bg-white flex flex-col justify-between h-full">
      <img
        src={poi.image_url}
        alt={poi.name}
        className="w-full h-80 object-cover rounded"
      />
      
      <div className="flex flex-col flex-grow">
        <h3 className="text-lg font-bold mt-2 text-green-900">{poi.name}</h3>
        <p className="text-sm text-gray-600">{poi.area}</p>
        <p className="text-sm mt-1">{poi.description}</p>
      </div>

      <a
        href={poi.map_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-600 underline mt-4"
      >
        View on Map
      </a>
    </div>
  );
}

// export default function POICard({ poi }) {
//   return (
//     <div className="rounded-lg shadow-md p-4 border bg-white">
//       <img src={poi.image_url} alt={poi.name} className="w-full h-40 object-cover rounded" />
//       {/* <h2 className="text-xl font-bold mt-2">{poi.name}</h2> */}
//       <h3 className="text-lg font-bold mt-2 text-green-900">
//         {poi.name}
//       </h3>
//       {/* <p className="text-gray-700">{poi.category} · {poi.area}</p> */}
//       <p className="text-sm text-gray-600">
//         {poi.area}
//       </p>
//       <p className="text-sm mt-1">{poi.description}</p>
//       <a
//         href={poi.map_url}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="text-sm text-blue-600 underline mt-2 inline-block"
//       >
//         View on Map
//       </a>
//     </div>
//   );
// }


// export default function POICard({ poi }) {
//   return (
//     <div className="rounded-lg shadow-md p-4 mb-4 border bg-white">
//       <img src={poi.image_url} alt={poi.name} className="w-full h-40 object-cover rounded" />
//       <h2 className="text-xl font-bold mt-2">{poi.name}</h2>
//       {/* 類別顯示為標籤 */}
//       <div className="flex flex-wrap gap-2 mt-1">
//         {Array.isArray(poi.category)
//           ? poi.category.map((cat, idx) => (
//               <span key={idx} className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
//                 {cat}
//               </span>
//             ))
//           : <span className="text-sm text-green-700">{poi.category}</span>}
//       </div>
//       <p className="text-gray-700 text-sm">{poi.area}</p>
//       <p className="text-sm mt-1">{poi.description}</p>
//       <a href={poi.map_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mt-2 inline-block">
//         View on Map
//       </a>
//     </div>
//   );
// }

// export default function POICard({ poi }) {
//   return (
//     <div className="rounded-lg shadow-md p-4 mb-4 border bg-white">
//       <img src={poi.image_url} alt={poi.name} className="w-full h-40 object-cover rounded" />
//       <h2 className="text-xl font-bold mt-2">{poi.name}</h2>
//       <p className="text-gray-700">{poi.category} ・ {poi.area}</p>
//       <p className="text-sm mt-1">{poi.description}</p>
//       <a href={poi.map_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mt-2 inline-block">View on Map</a>
//     </div>
//   );
// }

// export default function POICard({ poi }) {
//   return (
//     <div className="bg-white rounded-xl shadow-md overflow-hidden">
//       <img src={poi.image_url} alt={poi.name} className="w-full h-48 object-cover" />
//       <div className="p-4">
//         <h3 className="font-bold text-lg mb-2">{poi.name}</h3>
//         <p className="text-gray-600 text-sm">{poi.description}</p>
//       </div>
//     </div>
//   );
// }

// export default function POICard({ image, title, description }) {
//   return (
//     <div className="w-64">
//       <img src={image} alt={title} className="w-full h-48 object-cover rounded-t-2xl" />
//       <h3 className="font-semibold mt-2 text-green-900">{title}</h3>
//       <p className="text-sm text-gray-600 mt-1">{description}</p>
//     </div>
//   );
// }
