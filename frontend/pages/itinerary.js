import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import POICard from '../components/POICard'
import { useItinerary } from '../context/ItineraryContext'

/**
 * 將 form.start (YYYY-MM-DD) + offsetDays 轉成 YYYY/MM/DD
 * 以 'T00:00:00' 建立日期，避免時區造成的前後一天偏移
 */
function formatFromStart(startYmd, offsetDays) {
  if (!startYmd) return null
  const d = new Date(`${startYmd}T00:00:00`)
  d.setDate(d.getDate() + offsetDays)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${day}`
}

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
        // data.itinerary = [{ day: 1, pois: [...] }, ...]
        setItinerary(data.itinerary || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (queryParams) fetchItinerary()
    console.log('queryParams sent to backend:', queryParams)
  }, [queryParams])

  const handleSaveTrip = async () => {
    if (!form) return alert('Missing form data')
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('http://localhost:8000/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          start_date: form.start,
          end_date: form.end,
          interests: form.interests,
          preferences: form.prefs,
          schedule: itinerary,
        }),
      })
      console.log('📤 Send payload:', {
        start_date: form.start,
        end_date: form.end,
        interests: form.interests,
        preferences: form.prefs,
        schedule: itinerary,
      })
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
          {itinerary.map((dayObj) => {
            // Day N 的日期（N 從 1 開始，因此 offset = day-1）
            const labelDate = form?.start
              ? formatFromStart(form.start, dayObj.day - 1)
              : null

            return (
              <div key={dayObj.day}>
                <h2 className="text-l font-semibold text-green-800 mb-2">
                  Day {dayObj.day} - {labelDate ? ` (${labelDate})` : ''}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dayObj.pois.map((poi, poiIndex) => (
                    <POICard key={poiIndex} poi={poi} />
                  ))}
                </div>
              </div>
            )
          })}

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
