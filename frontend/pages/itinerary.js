import { useEffect, useMemo, useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import POICard from '../components/POICard'
import { useItinerary } from '../context/ItineraryContext'

// 從 LLM 的完整文字中抽出「explanation:」起點後的內容，若沒有就回傳原文（皆去除前後空白）
function extractExplanation(text) {
  if (!text) return ''
  const lower = text.toLowerCase()
  const idx = lower.indexOf('explanation:')
  const sliced = idx >= 0 ? text.slice(idx) : text
  return sliced.trim()
}
// Day index -> YYYY/MM/DD 顯示（依 form.start 推算），（給使用者看的行程日期）
function formatFromStart(startISO, dayIndex) {
  if (!startISO) return null
  const d = new Date(startISO)
  d.setDate(d.getDate() + dayIndex)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${day}`
}
// 由 form.start + offsetDays 取得 YYYY-MM-DD（給天氣 map 用）
function isoFromStart(startISO, dayIndex) {
  if (!startISO) return null
  const d = new Date(`${startISO}T00:00:00`)
  d.setDate(d.getDate() + dayIndex)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
// 取單一 POI 詳情（若你有批次 API：/api/pois?ids=1,2,3，請改成批次以節省請求數）
async function fetchPoiDetail(id) {
  const res = await fetch(`http://localhost:8000/api/pois/${id}`)
  if (!res.ok) throw new Error(`poi ${id} not found`)
  return res.json()
}
// 天氣膠囊（小圓角 pill）
function WeatherPill({ day, loading }) {
  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-800 text-sm">
        <span className="animate-pulse">Fetching weather…</span>
      </div>
    )
  }
  if (!day) return null
  const iconUrl = `https://openweathermap.org/img/wn/${day.icon}.png`
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-800 text-sm">
      <img src={iconUrl} alt={day.description} className="w-5 h-5" />
      <span className="capitalize">{day.description}</span>
      <span>· {day.temp_min}° / {day.temp_max}°C</span>
      <span>· {day.pop}% rain</span>
    </div>
  )
}

export default function ItineraryPage() {
  const { queryParams, form } = useItinerary()
  
  // LLM 行程與說明
  const [llmPlan, setLlmPlan] = useState(null)
  const [explanation, setExplanation] = useState('') 
  const [fallbackText, setFallbackText] = useState('') // 如果 LLM 沒給 JSON，就顯示全文
 
  // 以 id 為 key 的 POI 詳情快取（name, image_url, popularity, map_url ...）
  const [poiMap, setPoiMap] = useState({})  // POI 詳情快取
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  // 天氣 state
  const [wxMap, setWxMap] = useState({}) // {'YYYY-MM-DD': {temp_min,temp_max,icon,description,pop}}
  const [wxLoading, setWxLoading] = useState(false)

  // 展開/收合：key = day number（1-based）
  const [expandedDays, setExpandedDays] = useState({});
  // 預設「先顯示幾張卡」，想改成 6、9 或無上限（Infinity）都可以
  const MAX_PER_DAY = 3;

  // 序號：確保只採用「最後一次」請求結果
  const reqSeq = useRef(0);
  const lastKeyRef = useRef(null);

// 1) 抓取行程主流程：
// - 依 queryParams 或 form 組成 payload（避免 Strict Mode 重複、相同參數不重打）
// - 只採用「最後一次」請求結果（reqSeq + cancelled 保護）
// - 呼叫 /recommend_itinerary → normalize 統一成 {days,tips,explanation,itinerary_text}
// - 若 days 有值才覆蓋 llmPlan；否則僅設 fallbackText/explanation（避免洗掉既有行程）
// - finally 階段統一落下 setLoading(false)
useEffect(() => {
  // 1. 準備 payload：有 queryParams 就用，否則用 form
  const basePayload =
    (queryParams && Object.keys(queryParams || {}).length > 0)
      ? queryParams
      : {
          start: form?.start,
          end: form?.end,
          interests: form?.interests ?? [],
          prefs: form?.prefs ?? [],
          free_text_preferences: form?.freeTextPreferences ?? '',
          selected_poi_ids: form?.selectedPOIIds ?? [],
        };

  if (!basePayload?.start || !basePayload?.end) return;

  // 2. 相同參數不重打（避免 Strict Mode/多次 render 造成重複請求）
  const key = JSON.stringify(basePayload);
  if (lastKeyRef.current === key) return;
  lastKeyRef.current = key;

  // 3. 只接受最新回應
  const myId = ++reqSeq.current;
  let cancelled = false;

  // 小工具：把任何回傳 normalize 成 { days: [...], tips, explanation, itinerary_text }
  const normalize = (data) => {
    const days =
      (Array.isArray(data?.days) && data.days) ||
      (Array.isArray(data?.itinerary_json?.days) && data.itinerary_json.days) ||
      (Array.isArray(data?.itinerary?.days) && data.itinerary.days) ||
      (Array.isArray(data?.plan?.days) && data.plan.days) ||
      (Array.isArray(data) && data) || [];
    return {
      days,
      tips: Array.isArray(data?.tips) ? data.tips : [],
      explanation: data?.explanation || '',
      itinerary_text: data?.itinerary_text || '',
    };
  };

  (async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('http://localhost:8000/recommend_itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basePayload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const norm = normalize(data);
      console.log(norm)
      console.log('[itinerary] raw:', data);
      console.log('[itinerary] normalized days:', norm.days.length, 'req', myId);

      // 過期或已卸載就丟掉
      if (cancelled || myId !== reqSeq.current) return;

      // 4. 只有在 days 有內容時才覆蓋 llmPlan；否則完全忽略（不清空）
      if (norm.days.length > 0) {
        setLlmPlan({ days: norm.days, tips: norm.tips });
        setExplanation(norm.explanation);
        setFallbackText(norm.itinerary_text); // 有就留著，沒有也無妨
      } else if (norm.itinerary_text) {
        // 有純文字就顯示，但不要動 llmPlan（避免把有資料的行程洗掉）
        setFallbackText(norm.itinerary_text);
        setExplanation(norm.explanation);
      } else {
        console.warn('[itinerary] empty/invalid plan -> ignored (req', myId, ')');
      }
    } catch (err) {
      console.error(err);
      if (!cancelled && myId === reqSeq.current) {
        setError(err.message || 'Failed to load itinerary');
      }
    } finally {
      if (!cancelled && myId === reqSeq.current) {
        setLoading(false);
      }
    }
  })();

  return () => { cancelled = true; };
}, [
  JSON.stringify(queryParams ?? {}),
  form?.start,
  form?.end,
  (form?.interests || []).join(','),
  (form?.prefs || []).join(','),
  form?.freeTextPreferences,
  JSON.stringify(form?.selectedPOIIds || []),
]);


  // 2) 撈該行程用到的 POI 詳情，取這份行程所用到的所有 POI 詳情（依 id 去查，並快取）
  useEffect(() => {
    async function loadPOIs() {
      if (!llmPlan?.days?.length) return
      // 集合所有 item 的 id
      const ids = new Set()
      for (const day of llmPlan.days) {
        for (const b of (day.blocks || [])) {
          for (const it of (b.items || [])) {

            if (it.id) {
              const m = String(it.id).match(/\d+/)    // 只取數字
              const clean = m ? m[0] : String(it.id)  // 沒有數字就用原字串
              ids.add(clean)
            }

          }
        }
      }
      // 過濾已快取的
      const need = Array.from(ids).filter(id => !poiMap[id])
      if (need.length === 0) return

      const newMap = {}

      for (const id of need) {
        // 先把 id 變成純數字（取不到就用原字串），只取數字，再轉字串
        const numericId = String(id).match(/\d+/)?.[0] || String(id)

        try {
          const data = await fetchPoiDetail(numericId) // 用純數字去打 /api/pois/{id}
          newMap[numericId] = data                     // poiMap 的 key 也用同一個「字串 id」

        } catch (e) {
          console.warn('poi fetch failed:', id, e)
          newMap[numericId] = {                        // 同上
            id: numericId,
            name: `#${numericId}`,
            popularity: 0,
            image_url: '',
            map_url: `https://www.google.com/maps/search/?api=1&query=${numericId}`,
          }
        }
      }

      setPoiMap(prev => ({ ...prev, ...newMap }))
    }
    loadPOIs()
  }, [llmPlan]) // eslint-disable-line react-hooks/exhaustive-deps


  // 3) 轉成卡片資料（先宣告，下面的 useEffect 會用到它）
  const cardDays = useMemo(() => {
    if (!llmPlan || !Array.isArray(llmPlan.days)) return [];
    const days = llmPlan.days ?? [];
    console.log(days)
    const out = days.map((d, idx) => {
      const allItems = (d.blocks || []).flatMap(b => b.items || []);
      const mapToCard = (it) => {
        const key = String(it?.id ?? '').match(/\d+/)?.[0] || String(it?.id ?? '');
        const detail = poiMap[key] || {};
        return {
          id: key,
          name: detail.name || it?.name || `#${key}`,
          description: detail.introduction || '',
          area: detail.address || '',
          map_url: detail.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(detail.name || it?.name || `POI ${key}`)}`,
          image_url: detail.image_url || '',
          popularity: detail.popularity || 0,
        };
      };
      const allPois = allItems.map(mapToCard);
      const visiblePois = (expandedDays[idx + 1] ? allPois : allPois.slice(0, MAX_PER_DAY));
      return { day: idx + 1, date: d.date, allPois, visiblePois, total: allPois.length };
    });
    console.log('[cardDays] built:', out);
    return out;
  }, [llmPlan, poiMap, expandedDays]);


  // 4) 回退機制：只有當第一次 LLM 沒給 explanation 時，才呼叫 /explain_itinerary
  useEffect(() => {
    async function refreshExplanation() {
      if (!cardDays || cardDays.length === 0) return;
      // 若第一次 LLM 已經給了解釋，就直接用它（不再打第二次端點）
      if (explanation && String(explanation).trim().length > 0) return;

      const plan = cardDays.map(d => ({
        date: d.date || isoFromStart(form?.start, d.day - 1),
        ids: d.allPois.map(p => p.id),
      }));
      try {
        const r = await fetch('http://localhost:8000/explain_itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan })
        });
        if (r.ok) {
          const data = await r.json();
          setExplanation(extractExplanation(data.explanation || ''));
        }
      } catch (e) {
        console.warn('explain failed', e);
      }
    }
    refreshExplanation();
  }, [JSON.stringify(cardDays), explanation]);


  // 5) 天氣 ===== 新增：抓天氣（優先打後端 /weather，失敗再打前端 /api/weather） =====
  useEffect(() => {
    async function fetchWeather() {
      if (!form?.start || !form?.end) return
      setWxLoading(true)
      try {
        const qs = new URLSearchParams({ start: form.start, end: form.end }).toString()

        // 先打 FastAPI
        let resp = await fetch(`http://localhost:8000/weather?${qs}`)
        // 若後端沒有此路由，退回打 Next.js API
        if (resp.status === 404) {
          resp = await fetch(`/api/weather?${qs}`)
        }
        const data = await resp.json()
        if (!resp.ok) throw new Error(data?.detail || `Weather HTTP ${resp.status}`)

        const map = {}
        for (const d of (data.days || [])) {
          // 期待後端回 date: YYYY-MM-DD；若不是，可在此調整
          map[d.date] = d
        }
        setWxMap(map)
      } catch (e) {
        console.warn('weather fetch failed:', e)
        setWxMap({})
      } finally {
        setWxLoading(false)
      }
    }
    fetchWeather()
  }, [form?.start, form?.end])


  // 6) Save Trip
  async function handleSaveTrip() {
    try {
      setSaving(true)
      setSaveMsg('')
      const schedule = cardDays.map((d) => ({
        day: d.day,
        pois: d.allPois,   
      }))
      const payload = {
        title: form?.tripName || 'My Trip',
        start_date: form?.start,
        end_date: form?.end,
        schedule,
        interests: form?.interests ?? [],
        preferences: form?.prefs ?? [],
      }

      const token = localStorage.getItem('token') // 取 JWT
      const res = await fetch('http://localhost:8000/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSaveMsg('Saved!')
    } catch (e) {
      console.error(e)
      setSaveMsg('Save failed.')
    } finally {
      setSaving(false)
    }
  }


  return (
    <>
      <Navbar />
      <main className="px-6 lg:px-10 py-8">
        <h1 className="text-2xl md:text-2xl font-bold text-green-800 mb-6">
          Recommended Itinerary
        </h1>
        {loading && <p>Loading…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {/* Fallback：LLM 沒給 JSON，就直接顯示原文（你也可以不顯示） */}
        {!loading && !error && !llmPlan && !!fallbackText && (
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 border rounded p-4">
            {fallbackText}
          </pre>
        )}
                
        {!loading && !error && (llmPlan || fallbackText) && (
          <div className="space-y-10">
            {cardDays.map((d) => {
              // 標題顯示用
              const labelDate =
                d.date ? d.date : formatFromStart(form?.start, d.day - 1)
              // 天氣索引用（YYYY-MM-DD）
              const isoDate =
                d.date ? d.date : isoFromStart(form?.start, d.day - 1)
              
              return (
                <section key={d.day}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-semibold text-green-900">
                      Day {d.day}
                      {labelDate ? ` - (${labelDate.replaceAll('-', '/')})` : null}
                    </h2>
                    <WeatherPill day={wxMap[isoDate]} loading={wxLoading} />
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    {d.visiblePois.map(poi => <POICard key={poi.id} poi={poi} />)}
                  </div>
                  {d.total > MAX_PER_DAY && (
                    <div className="mt-3">
                      <button
                        onClick={() => setExpandedDays(prev => ({ ...prev, [d.day]: !prev[d.day] }))}
                        className="px-4 py-2 rounded-lg border border-gray-300 bg-green-600 text-white hover:bg-green-700"
                      >
                        {expandedDays[d.day] ? 'Show fewer' : `Show all (${d.total})`}
                      </button>
                    </div>
                  )}
                </section>
              )
            })}

            {/* Save Trip */}
            <div className="text-center">
              <button
                onClick={handleSaveTrip}
                disabled={saving}
                className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save Trip'}
              </button>
              
              {!!saveMsg && (
                <div className="mt-2 text-sm bold text-gray-600">{saveMsg}</div>
              )}
            </div>

            {!!explanation && (
              <div className="mt-6 p-5 rounded-xl bg-green-50 border border-green-200">
                <h3 className="font-semibold text-green-800 mb-1">Why this plan</h3>
                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800">
                  {extractExplanation(explanation)}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  )
}