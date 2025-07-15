import ItineraryForm from "./ItineraryForm";
import WeatherBox from "./WeatherBox";

export default function HeroSection() {
  return (
    <section className="px-6 py-12 text-center bg-white">
      <h1 className="text-4xl font-semibold text-green-900 leading-tight">
        Plan your perfect Taipei <br />— tailored just for you.
      </h1>
      <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-8">
        <ItineraryForm />
        <WeatherBox />
      </div>
    </section>
  );
}