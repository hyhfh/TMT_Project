import { useEffect, useState } from "react";
import POICard from "./POICard";
import { useItinerary } from "../context/ItineraryContext";

export default function RecommendationsSection() {
  const [pois, setPois] = useState([]);
  const { selectedPOIIds, toggleSelectedPOI, clearSelectedPOIs } = useItinerary();

  useEffect(() => {
    fetch("http://localhost:8000/api/top_pois")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`GET /api/top_pois ${res.status} ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("🔥 Data from /api/top_pois:", data);
        // 允許三種常見回傳：array | {items: array} | 其他 → 空
        const list = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
        setPois(list);
      })
      .catch((err) => {
        console.error("Error fetching POIs:", err);
        setPois([]); // 失敗就清空，避免殘留
      });
  // fetch("http://localhost:8000/api/top_pois")
  //   .then((res) => res.json())
  //   .then((data) => {
  //     console.log("🔥 Data from /api/top_pois:", data);  // 加這一行
  //     setPois(data);
  //   })
  //   .catch((err) => console.error("Error fetching POIs:", err));
}, []);

  return (
    <section>
        {/* <h2 className="text-2xl font-semibold mt-10 mb-2 text-green-800">
          Top Recommendations
        </h2> */}
        <h2 className="text-2xl font-semibold mt-10 mb-2 text-green-800">
          Top Recommendations ✅
        </h2>
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <div>Selected: <span className="font-semibold">{selectedPOIIds.length}</span></div>
          {selectedPOIIds.length > 0 && (
            <button onClick={clearSelectedPOIs} className="underline">Clear</button>
          )}
        </div>

      {/* <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-800">
        Top Recommendations
      </h2> */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pois.map((poi) => (
          <div key={poi.id} className="border rounded-lg shadow-md p-4">
            <img
              src={poi.image_url}
              alt={poi.name}
              className="w-full h-48 object-cover rounded-t-lg"
              onError={(e) => { e.target.src = '/images/default.jpeg'; }}
            />
            <h3 className="font-bold mt-2">{poi.name}</h3>
          </div>
        ))}
      </div> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pois.map((poi) => (
          <POICard
            key={poi.id ?? poi.name}
            poi={poi}
            selectable={true}                                   // ✅ 開啟勾選
            selected={selectedPOIIds.includes(poi.id)}          // ✅ 是否已選
            onToggleSelect={toggleSelectedPOI}                  // ✅ 勾/取消
          />
          // <POICard
          //   key={poi.id}
          //   poi={poi}
          //   isSelected={selectedPOIs.includes(poi.id)}
          //   onSelect={() => togglePOI(poi.id)}
          // />
        ))}
      </div>
    </section>
  );
}