import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import WeatherBox from "../components/WeatherBox";
import ItineraryForm from "../components/ItineraryForm";
import RecommendationsSection from "../components/RecommendationsSection";
import { useRouter } from 'next/router'
import { useItinerary } from '../context/ItineraryContext'

export default function Home() {
  const router = useRouter()
  // // 使用新的 context state setter
  // const { setItineraryInput } = useItinerary();
  const { setQueryParams, setForm } = useItinerary()

  const handleSubmit = (formData) => {
    // // 只需要呼叫一次 setter
    // setItineraryInput(formData);
    setForm(formData)
    setQueryParams(formData)
    router.push('/itinerary')
  }

  return (
    <div>
      <Navbar />
      <main className="px-6 py-4">
        <HeroSection /> 
        <div className="flex flex-col md:flex-row justify-center gap-6 items-stretch max-w-5xl mx-auto px-4">
          <div className="w-full md:w-1/2">
            <ItineraryForm onSubmit={handleSubmit} />
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

  // const handleSubmit = (e) => {
  //   e.preventDefault()
  //   const formData = {
  //     start_date: '2025-08-01',
  //     end_date: '2025-08-03',
  //     interests: ['Nature', 'Food'],
  //     budget: 'mid',
  //   }

  //   setQueryParams(formData)
  //   router.push('/itinerary')
  // }