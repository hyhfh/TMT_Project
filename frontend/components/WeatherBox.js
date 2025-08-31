import { useEffect, useState } from "react";

export default function WeatherBox() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/weather") 
      .then((res) => res.json())
      .then((data) => setWeather(data))
      .catch((err) => console.error("Failed to fetch weather:", err));
  }, []);

  if (!weather) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 h-full flex items-center justify-center">
        <p>Loading weather...</p>
      </div>
    );
  }

  const iconCode = weather.icon;

  const bgColorMap = {
    "01d": "rgba(255,245,230,0.5)", // clear day
    "02d": "rgba(237,241,234,0.5)", // few clouds
    "03d": "rgba(230,235,229,0.5)", // scattered clouds
    "04d": "rgba(219,230,213,0.84)", // broken clouds
    "09d": "rgba(222,232,236,0.5)", // shower rain
    "10d": "rgba(210,228,250,0.5)", // rain
    "11d": "rgba(245,235,215,0.5)", // thunderstorm
    "13d": "rgba(243,250,250,0.5)", // snow
    "50d": "rgba(235,235,235,0.5)", // mist
  };
  const bgColor = bgColorMap[iconCode] || "rgba(219,230,213,0.5)";

  const localTime = new Date().toLocaleTimeString("en-GB", {
    timeZone: "Asia/Taipei",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      style={{ backgroundColor: bgColor }}
      className="rounded-2xl p-6 h-full flex flex-col justify-center items-center text-center backdrop-blur-md border border-white/30 shadow-xl animate-fade-in"
    >
      <div className="bg-white rounded-full p-3 shadow-md border border-gray-200 hover:scale-105  transition-opacity duration-300 ease-in mb-4">
        <img
          src={`https://openweathermap.org/img/wn/${iconCode}@2x.png`}
          alt={weather.description}
          className="w-20 h-20 mb-2"
        />
      </div>
      <h2 className="text-4xl font-extrabold text-green-900">
        {Math.round(weather.temp)}°C</h2>
      <p className="capitalize text-green-800 text-2xl">
        {weather.description}</p>
      <p className="text-gray-600 text-lg mt-2">Local Time: {localTime}</p>
      <p className="text-gray-600 text-base">Location: Taipei</p>
    </div>
  );
}