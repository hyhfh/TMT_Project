import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import WeatherBox from "../components/WeatherBox";
import ItineraryForm from "../components/ItineraryForm";
import POICard from "../components/POICard"; 
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useItinerary } from "../context/ItineraryContext";

export default function Home() {
  const router = useRouter();
  const { setForm, selectedPOIIds, toggleSelectedPOI } = useItinerary();
  const [topPOIs, setTopPOIs] = useState([]);
  const [loading, setLoading] = useState(true);
  const handleSubmit = (formData) => {
    setForm(formData);
    router.push("/itinerary");
  };

  useEffect(() => {
  const fetchTopPOIs = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/top_pois");
      const data = await res.json();
      if (Array.isArray(data)) {
        setTopPOIs(data);
      } else {
        console.error("Invalid data from API:", data);
      }
    } catch (err) {
      console.error("Failed to fetch top POIs:", err);
    } finally {
      setLoading(false);  
    }
  };
  fetchTopPOIs();
}, []);

  return (
    <div>
      <Navbar />
      <main className="px-6 py-4">
        <HeroSection />
        <div className="flex flex-col md:flex-row justify-center gap-6 max-w-5xl mx-auto px-4">
          <div className="w-full md:w-1/2">
            <ItineraryForm onSubmit={handleSubmit} />
          </div>
          <div className="w-full md:w-1/2">
            <WeatherBox />
          </div>
        </div>
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-green-800 mb-2">Top Recommendations</h2>
          <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
            <div>Selected: <span className="font-semibold">{selectedPOIIds.length}</span></div>
            {selectedPOIIds.length > 0 && (
              <button className="underline" onClick={() => selectedPOIIds.forEach(toggleSelectedPOI)}>
                Clear
              </button>
            )}
          </div>
          {loading ? (
            <p className="text-gray-500">Loading recommendations...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {topPOIs.map((poi, index) => (
                <POICard
                  key={index}
                  poi={{
                    id: poi.id,
                    name: poi.name,
                    image_url: poi.image_url,
                  }}
                  showIntro={false}
                  selectable={true}                                  
                  selected={selectedPOIIds.includes(poi.id)}          
                  onToggleSelect={toggleSelectedPOI}         
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}