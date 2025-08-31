import { createContext, useContext, useState } from 'react'

const ItineraryContext = createContext()

export function ItineraryProvider({ children }) {
  const [queryParams, setQueryParams] = useState(null)
  const [form, setForm] = useState(null);
  const [selectedPOIIds, setSelectedPOIIds] = useState([]);
  const toggleSelectedPOI = (id) => {
    setSelectedPOIIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const clearSelectedPOIs = () => setSelectedPOIIds([]);

  return (
    <ItineraryContext.Provider
      value={{
        queryParams, setQueryParams,
        form, setForm,
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