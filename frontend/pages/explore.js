import Navbar from "../components/Navbar";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function ExplorePage() {
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:8000/api/pois");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPois(Array.isArray(data) ? data : []);
        console.log("POIs sample:", data?.[0]);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div>
        <Navbar />
        <main className="max-w-6xl mx-auto p-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-green-800 tracking-tight mb-6">
            Explore Taipei City Attractions
          </h1>

          {/* Skeleton grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
                <div className="w-full aspect-[16/9] rounded-xl bg-gray-200 animate-pulse" />
                <div className="h-5 w-2/3 bg-gray-200 rounded mt-4 animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded mt-2 animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded mt-4 animate-pulse" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (err) {
    return (
      <div>
        <Navbar />
        <main className="max-w-6xl mx-auto p-6">
          <p className="text-red-600">Error: {err}</p>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-green-800 tracking-tight mb-6">
          Explore Taipei City Attractions
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pois.map((poi, index) => (
            <POICard key={poi.id ?? index} poi={poi} />
          ))}
        </div>
      </main>
    </div>
  );
}

/* ----------------------- */
/*   卡片元件（與詳情頁同風格）  */
/* ----------------------- */
function POICard({ poi }) {
  const realId = poi?.id ?? poi?.poi_id ?? poi?._id ?? null;
  const href = realId ? `/poi/${realId}` : `/poi/${encodeURIComponent(poi.name)}`;

  const tags = useMemo(() => {
    const keys = ["attraction", "food", "nature", "culture", "shopping"];
    return keys.filter((k) => !!poi?.[k]).map((k) => capitalize(k));
  }, [poi]);

  const popularityText = useMemo(() => {
    if (poi?.popularity === undefined || poi?.popularity === null) return null;
    try {
      return Number(poi.popularity).toLocaleString();
    } catch {
      return poi.popularity;
    }
  }, [poi]);

  return (
    <div className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition">
      {/* 圖片區 */}
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <img
          src={poi.image_url || "/placeholder.jpg"}
          alt={poi.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      {/* 內容區 */}
      <div className="p-5">
        <h2 className="text-xl font-semibold text-green-800 leading-snug">
          {poi.name}
        </h2>

        {/* 標籤 */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((t) => (
              <span
                key={t}
                className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* 簡介 */}
        {poi.introduction && (
          <p className="text-gray-700 text-sm mt-3 line-clamp-3">
            {poi.introduction}
          </p>
        )}

        {/* 按鈕區塊：靠卡片底部兩端 */}
          <div className="mt-auto pt-4 flex justify-between items-center">
            <Link
              href={href}
              // className="px-3 py-2 rounded-xl border border-gray-300 text-sm hover:bg-gray-50 transition"
              className="text-sm text-gray-600 underline"
            >
              Read more
            </Link>

            {poi.map_url && (
              <a
                href={poi.map_url}
                target="_blank"
                rel="noopener noreferrer"
                // className="px-3 py-2 rounded-xl bg-green-600 text-white text-sm hover:bg-green-700 transition shadow"
                className="px-3 py-2 rounded-xl border border-gray-300 text-sm bold text-green-600 transition"
              >
                Open in Google Maps
              </a>
            )}
          </div>
      </div>
    </div>
  );
}

/* 工具：首字大寫 */
function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// import Navbar from "../components/Navbar";
// import { useEffect, useState } from 'react';
// import Link from "next/link";

// export default function ExplorePage() {
//   const [pois, setPois] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch('http://localhost:8000/api/pois');
//         const data = await res.json();
//         // 先印出來看欄位長什麼樣（第一次除錯很重要）
//         console.log("POIs sample:", data?.[0]);
//         setPois(Array.isArray(data) ? data : []);
//       } catch (e) {
//         console.error("載入景點失敗", e);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   if (loading) {
//     return (
//       <div>
//         <Navbar />
//         <div className="p-6">loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <Navbar />
//       <div className="p-6">
//         <h1 className="text-2xl font-bold text-green-800 mb-4">
//           Explore Taipei City Attractions
//         </h1>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {pois.map((poi, index) => {
//             // 你資料中真正的 id 欄位可能叫 id / poi_id / _id 等，這裡做個容錯
//             const realId = poi?.id ?? poi?.poi_id ?? poi?._id ?? null;
//             // 如果沒有 id，就用 name 當路由參數（搭配詳細頁用 by_name 查詢）
//             const href = realId
//               ? `/poi/${realId}`
//               : `/poi/${encodeURIComponent(poi.name)}`;

//             return (
//               <div key={realId ?? `${poi.name}-${index}`} className="border rounded-xl shadow p-4 flex flex-col justify-between">
//                 {poi.image_url && (
//                   <img
//                     src={poi.image_url}
//                     alt={poi.name}
//                     className="w-full h-48 object-cover rounded-lg mb-3"
//                   />
//                 )}
//                 <h2 className="text-xl font-semibold text-green-800">{poi.name}</h2>
//                 {poi.introduction && (
//                   <p className="text-gray-700 text-sm mt-1 mb-2 line-clamp-3">{poi.introduction}</p>
//                 )}

//                 <div className="flex justify-between items-center mt-2">
//                   <Link href={href} className="text-sm text-green-600 underline">
//                     Read more
//                   </Link>

//                   {poi.map_url && (
//                     <a
//                       href={poi.map_url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-sm text-blue-600 underline"
//                     >
//                       View on Map
//                     </a>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }