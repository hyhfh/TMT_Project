import { createContext, useContext, useState } from 'react'

const ItineraryContext = createContext()

export function ItineraryProvider({ children }) {
  const [queryParams, setQueryParams] = useState(null)
  const [form, setForm] = useState(null);

  // // 只用一個 state 來管理表單輸入
  // const [itineraryInput, setItineraryInput] = useState(null);

  return (
    <ItineraryContext.Provider value={{ queryParams, form, setQueryParams, setForm }}>
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItinerary() {
  return useContext(ItineraryContext)
}
