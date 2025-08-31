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
        console.log("Data from /api/top_pois:", data);
        const list = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
        setPois(list);
      })
      .catch((err) => {
        console.error("Error fetching POIs:", err);
        setPois([]); 
      });
}, []);

  return (
    <section>
        <h2 className="text-2xl font-semibold mt-10 mb-2 text-green-800">
          Top Recommendations
        </h2>
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <div>Selected: <span className="font-semibold">{selectedPOIIds.length}</span></div>
          {selectedPOIIds.length > 0 && (
            <button onClick={clearSelectedPOIs} className="underline">Clear</button>
          )}
        </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pois.map((poi) => (
          <POICard
            key={poi.id ?? poi.name}
            poi={poi}
            selectable={true}                                 
            selected={selectedPOIIds.includes(poi.id)}        
            onToggleSelect={toggleSelectedPOI}                 
          />
        ))}
      </div>
    </section>
  );
}