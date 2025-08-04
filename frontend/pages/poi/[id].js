import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function POIDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [poi, setPoi] = useState(null);

  useEffect(() => {
  if (!router.isReady) return;
  const fetchPOI = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/poi/${router.query.id}`);
      if (!res.ok) throw new Error("POI not found");
      const data = await res.json();
      setPoi(data);
    } catch (err) {
      console.error(err);
    }
  };
  fetchPOI();
}, [router.isReady]);

  if (!poi) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-4">{poi.name}</h1>
      <p className="mb-2 text-gray-700">{poi.address}</p>
      <p className="mb-4">{poi.introduction}</p>
      {poi.popularity !== undefined && (
        <p className="mb-2">🔥 Popularity: {poi.popularity}</p>
      )}
      {poi.map_url && (
        <a
          href={poi.map_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-700 underline"
        >
          View on map
        </a>
      )}
    </div>
  );
}

// import { useRouter } from "next/router"
// import { useEffect, useState } from "react"

// export default function PoiDetailPage() {
//   const router = useRouter()
//   const { id } = router.query
//   const [poi, setPoi] = useState(null)

//   useEffect(() => {
//     if (id) {
//       fetch(`http://localhost:8000/api/poi/${id}`)
//         .then((res) => res.json())
//         .then((data) => setPoi(data))
//     }
//   }, [id])

//   if (!poi) return <p>Loading...</p>

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold text-green-800">{poi.name}</h1>
//       <p>{poi.introduction}</p>
//       <p>🔥 Popularity: {poi.popularity}</p>
//       <a href={poi.map_url} target="_blank" className="text-green-600">View on map</a>
//     </div>
//   )
// }