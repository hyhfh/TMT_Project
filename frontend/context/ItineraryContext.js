import { createContext, useContext, useState } from 'react'

const ItineraryContext = createContext()

export function ItineraryProvider({ children }) {
  const [queryParams, setQueryParams] = useState(null)
  const [form, setForm] = useState(null);

    // ✅ 新增：首頁 Top Recommendations 勾選的 POI IDs
  const [selectedPOIIds, setSelectedPOIIds] = useState([]);
  const toggleSelectedPOI = (id) => {
    setSelectedPOIIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const clearSelectedPOIs = () => setSelectedPOIIds([]);

  

  return (
    // <ItineraryContext.Provider value={{ queryParams, form, setQueryParams, setForm }}>
    <ItineraryContext.Provider
      value={{
        queryParams, setQueryParams,
        form, setForm,
        // ✅ 新增
        selectedPOIIds, toggleSelectedPOI, clearSelectedPOIs,
      }}
    >
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItinerary() {
  return useContext(ItineraryContext)
}
