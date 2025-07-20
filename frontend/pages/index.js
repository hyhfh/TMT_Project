import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import WeatherBox from "../components/WeatherBox";
import ItineraryForm from "../components/ItineraryForm";
import RecommendationsSection from "../components/RecommendationsSection";

export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="px-6 py-4">
        <HeroSection /> 
        <div className="flex flex-col md:flex-row justify-center gap-6 items-stretch max-w-5xl mx-auto px-4">
          <div className="w-full md:w-1/2">
            <ItineraryForm />
          </div>
          <div className="w-full md:w-1/2">
            <WeatherBox />
          </div>
        </div>
        <RecommendationsSection />  
      </main>
    </div>
  );
}