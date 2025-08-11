import { useState } from "react";
import { useRouter } from "next/router";
import { useItinerary } from "../context/ItineraryContext";

const today = new Date().toISOString().split("T")[0];

export default function ItineraryForm({ onSubmit }) {
  // const { setQueryParams } = useItinerary();
  const { setQueryParams, setForm, selectedPOIIds } = useItinerary();
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interests, setInterests] = useState([]);
  const [prefs, setPrefs] = useState([]);
  const [freeTextPreferences, setFreeTextPreferences] = useState("");

  const toggleItem = (list, value, setter) => {
    setter(
      list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value]
    );
  };

  const handleSubmit = () => {
    if (!startDate || !endDate) {
    alert("Please select both start and end dates!");
    return;
  }
    const formData = {
      start:      startDate,
      end:        endDate,
      interests,
      prefs,
      freeTextPreferences,
      selected_poi_ids: selectedPOIIds,   // ✅ 新增：勾選的 POI IDs 
    }
    setQueryParams(formData);  // ✅ 把資料存進 context
    setForm(formData);                    // ✅ 讓 /itinerary 可以拿來存 Trip
    onSubmit(formData)  // ← 將表單資料傳回首頁的父元件
  }

  return (
    <div
      className="
        rounded-2xl p-6
        backdrop-blur-md bg-white/70 border border-white/30 shadow-xl
        animate-fade-in
        w-full max-w-md
      "
    >
      <div className="flex flex-col gap-4 text-sm">

        {/* 日期選擇 */}
        <div className="flex flex-col gap-2">
          <label className="text-lg font-semibold text-gray-600">Start Date</label>
          <input
            type="date"
            min={today}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="border px-3 py-2 rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-lg font-semibold text-gray-600">End Date</label>
          <input
            type="date"
            min={startDate || today}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        </div>

        {/* Interests & Preferences */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-base font-semibold mb-1 text-gray-500">Interests</p>
            {["Attraction", "Food", "Nature", "History & Culture", "Shopping"].map((label) => (
              <label key={label} className="flex items-center gap-2 mb-1 text-sm">
                <input
                  type="checkbox"
                  checked={interests.includes(label)}
                  onChange={() => toggleItem(interests, label, setInterests)}
                />
                {label}
              </label>
            ))}
          </div>

          <div>
            <p className="text-base font-semibold mb-1 text-gray-500">Preferences</p>
            {[
              "No early morning starts",
              "No tight schedule",
              "Nightlife",
              "Museums",
              "Shopping malls",
            ].map((label) => (
              <label key={label} className="flex items-center gap-2 mb-1 text-sm">
                <input
                  type="checkbox"
                  checked={prefs.includes(label)}
                  onChange={() => toggleItem(prefs, label, setPrefs)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="freeText" className="block font-medium text-gray-700">
            Additional Preferences
          </label>
          <textarea
            id="freeText"
            rows="2"
            className="w-full mt-1 p-2 border rounded"
            value={freeTextPreferences}
            onChange={(e) => setFreeTextPreferences(e.target.value)}
            placeholder="e.g., No hiking, prefer indoor attractions..."
          />
        </div>
        {/* 送出按鈕 */}
        <button
          onClick={handleSubmit}
          // disabled={!startDate || !endDate}  // disabled 條件判斷
          className="
            mt-4 w-full py-2 rounded
            bg-green-700 text-white
            disabled:bg-gray-400 disabled:cursor-not-allowed
            hover:bg-green-800 transition-colors
          "
        >
          Generate Itinerary
        </button>
      </div>
    </div>
  );
}