import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import POICard from '../components/POICard'
import { useItinerary } from '../context/ItineraryContext'

// 測試用的假資料 (和你的 FastAPI 回傳結構一樣)
const mockResponse = {
  itinerary: [
    [
      {
        name: "Taipei 101",
        image_url: "/images/Taipei_101_1.jpg",
        description: "Landmark skyscraper in Taipei.",
        area: "Xinyi District",
        map_url: "https://maps.app.goo.gl/655VtbVJkX3jv3ri7"
      }
    ],
    [
      {
        name: "Shilin Night Market",
        image_url: "/images/Shilin_NM_1.png",
        description: "Famous night market with food and games.",
        area: "Shilin District",
        map_url: "https://maps.app.goo.gl/ACxmfh6EYzq9sgCx6"
      }
    ]
  ]
}

// 確保我們拿到的是 二維陣列：
// 如果後端只回一維，就把它包成 [ [poi,...], [...], ... ]
function normalizeItinerary(it) {
  if (!Array.isArray(it)) return []
  return it.map(day => Array.isArray(day) ? day : [day])
}

export default function ItineraryPage() {
  // // 取得整合後的 state
  // const { itineraryInput } = useItinerary();
  // const [itinerary, setItinerary] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  const { queryParams, form } = useItinerary()
  const [itinerary, setItinerary] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchItinerary() {
      try {
        const res = await fetch('http://localhost:8000/recommend_itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // // 直接使用 itineraryInput 作為請求的 body
          // body: JSON.stringify(itineraryInput),
          body: JSON.stringify(queryParams),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        console.log('Backend returned:', data)
        setItinerary(normalizeItinerary(data.itinerary))
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (queryParams) {
      fetchItinerary()
  // queryParams 是使用者選的日期與感興趣的選項
    } else {
  //     setLoading(false);
  //     setError("No input data. Please return to the homepage to generate an itinerary.");
  //   }
  // }, [itineraryInput]); // 依賴 itineraryInput
      // 沒有 queryParams 時，用偽資料測試
      setTimeout(() => {
        setItinerary(normalizeItinerary(mockResponse.itinerary))
        setLoading(false)
      }, 500)
    }
  }, [queryParams])

  const handleSaveTrip = async () => {
    if (!form) return alert("Missing form data")
    const { start, end, interests, prefs } = form;

  // const handleSaveTrip = async () => {
  //   // 判斷條件也跟著改變
  //   if (!itinerary) {
  //     alert('Missing form data');
  //     return;
  //   }

    const token = localStorage.getItem('token')
    try {
      const res = await fetch('http://localhost:8000/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          // // 從 itineraryInput 中取得後端需要的資料
          // start_date: itineraryInput.start,
          // end_date: itineraryInput.end,
          // interests: itineraryInput.interests,
          // preferences: itineraryInput.prefs,
          // schedule: itinerary, 
          // `itinerary` 是你從 API 獲取並存在 state 中的行程資料
          start_date: form.start,
          end_date: form.end,
          interests: form.interests,
          preferences: form.prefs,
          schedule: itinerary,
        }),
      })
      console.log("📤 Send payload:", {
        start_date: form.start,
        end_date: form.end,
        interests: form.interests,
        preferences: form.prefs,
        schedule: itinerary,
      });
      const result = await res.json()
      if (res.ok) {
        alert('Trip saved successfully!')
      } else {
        alert('Failed: ' + (result.detail || 'Unknown error'))
      }
    } catch (err) {
      console.error(err)
      alert('Network error')
    }
  }

  return (
    <div>
      <Navbar />
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-green-800">
          Recommended Itinerary
        </h1>

        {loading && <p className="text-gray-500">Loading itinerary…</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && itinerary.length === 0 && (
          <p className="text-gray-600">
            No recommendations found. Try adjusting your input.
          </p>
        )}

        <div className="space-y-8">
          {itinerary.map((day, dayIndex) => (
            <div key={dayIndex}>
              <h2 className="text-xl font-semibold text-green-700 mb-2">
                Day {dayIndex + 1}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {day.map((poi, poiIndex) => (
                  <POICard key={poiIndex} poi={poi} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleSaveTrip}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Save Trip
          </button>
        </div>
      </main>
    </div>
  )
}
