import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import RecommendationsSection from '../components/RecommendationsSection'

export default function Home() {
  return (
    <div>
      <Navbar />
      <main>
        <HeroSection />
        <RecommendationsSection />
      </main>
    </div>
  )
}