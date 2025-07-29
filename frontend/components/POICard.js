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