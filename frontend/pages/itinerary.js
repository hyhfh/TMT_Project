import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import POICard from '../components/POICard'
import { useItinerary } from '../context/ItineraryContext'

export default function ItineraryPage() {
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
          body: JSON.stringify(queryParams),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setItinerary(data.itinerary)    // data.itinerary = [{day:1, pois:[…]},…]
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (queryParams) fetchItinerary()
    console.log("queryParams sent to backend:", queryParams)
  }, [queryParams])

  const handleSaveTrip = async () => {
    if (!form) return alert("Missing form data")
    const { start, end, interests, prefs } = form;

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
          {itinerary.map((dayObj) => (
            <div key={dayObj.day}>
              <h2 className="text-xl font-semibold text-green-700 mb-2">
                Day {dayObj.day}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dayObj.pois.map((poi, poiIndex) => (
                  <POICard key={poiIndex} poi={poi} />
                ))}
              </div>
            </div>
          ))}
         <div className="mt-6 text-center">
           <button
             onClick={handleSaveTrip}
             className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
           >
             Save Trip
           </button>
         </div>
        </div>
      </main>
    </div>
  )
}

// import { useState, useEffect } from 'react'
// import Navbar from '../components/Navbar'
// import POICard from '../components/POICard'
// import { useItinerary } from '../context/ItineraryContext'

// // 1) 先宣告 normalizeItinerary
// function normalizeItinerary(it) {
//   if (!Array.isArray(it)) return [];
//   return it.map(day => Array.isArray(day) ? day : [day]);
// }

// export default function ItineraryPage() {
//   const { queryParams, form } = useItinerary()
//   const [itinerary, setItinerary] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     async function fetchItinerary() {
//       const res = await fetch('http://localhost:8000/recommend_itinerary', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(queryParams),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const data = await res.json();
//       console.log('後端回傳：', data);
//       setItinerary(data.itinerary);
//     }
//     if (queryParams) fetchItinerary();
//   }, [queryParams]);

//   const handleSaveTrip = async () => {
//     if (!form) return alert("Missing form data")
//     const { start, end, interests, prefs } = form;

//     const token = localStorage.getItem('token')
//     try {
//       const res = await fetch('http://localhost:8000/trips', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//            "Authorization": `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           // // 從 itineraryInput 中取得後端需要的資料
//           // start_date: itineraryInput.start,
//           // end_date: itineraryInput.end,
//           // interests: itineraryInput.interests,
//           // preferences: itineraryInput.prefs,
//           // schedule: itinerary, 
//           // `itinerary` 是你從 API 獲取並存在 state 中的行程資料
//           start_date: form.start,
//           end_date: form.end,
//           interests: form.interests,
//           preferences: form.prefs,
//           schedule: itinerary,
//         }),
//       })
//       console.log("📤 Send payload:", {
//         start_date: form.start,
//         end_date: form.end,
//         interests: form.interests,
//         preferences: form.prefs,
//         schedule: itinerary,
//       });
//       const result = await res.json()
//       if (res.ok) {
//         alert('Trip saved successfully!')
//       } else {
//         alert('Failed: ' + (result.detail || 'Unknown error'))
//       }
//     } catch (err) {
//       console.error(err)
//       alert('Network error')
//     }
//   }

//   return (
//     <div>
//       <Navbar />
//       <main className="p-6">
//         <h1 className="text-2xl font-bold mb-4 text-green-800">
//           Recommended Itinerary
//         </h1>

//         {loading && <p className="text-gray-500">Loading itinerary…</p>}
//         {error && <p className="text-red-500">Error: {error}</p>}
//         {!loading && !error && itinerary.length === 0 && (
//           <p className="text-gray-600">
//             No recommendations found. Try adjusting your input.
//           </p>
//         )}

//         <div className="space-y-8">
//           {itinerary.map((day, dayIndex) => (
//             <div key={dayIndex}>
//               <h2 className="text-xl font-semibold text-green-700 mb-2">
//                 Day {dayIndex + 1}
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {day.map((poi, poiIndex) => (
//                   <POICard key={poiIndex} poi={poi} />
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="mt-6 text-center">
//           <button
//             onClick={handleSaveTrip}
//             className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
//           >
//             Save Trip
//           </button>
//         </div>
//       </main>
//     </div>
//   )
// }
