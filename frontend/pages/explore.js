import Navbar from "../components/Navbar";
import { useEffect, useState } from 'react';
import Link from "next/link";

export default function ExplorePage() {
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);

  // 呼叫 /api/pois，從 /api/pois 取得 POI 資料並渲染至畫面
  useEffect(() => {
    fetch('http://localhost:8000/api/pois')
      .then((res) => res.json())
      .then((data) => {
        setPois(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("載入景點失敗", error);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-green-800 mb-4">Explore Taipei City Attractions</h1>
        {loading ? (
          <p>loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pois.map((poi, index) => (
              <div key={index} className="border rounded-xl shadow p-4 flex flex-col justify-between">
                <img
                  src={poi.image_url}
                  alt={poi.name}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <h2 className="text-xl font-semibold text-green-800">{poi.name}</h2>
                <p className="text-gray-700 text-sm mt-1 mb-2 line-clamp-3">{poi.introduction}</p>
                  <Link href={`/poi/${poi.id}`} className="text-sm text-green-600 underline mt-2">
                    Read more
                  </Link>
                <a
                  href={poi.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline self-end mt-auto"
                >
                  View on Map
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
