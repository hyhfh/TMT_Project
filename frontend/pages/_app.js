import '../styles/globals.css'
import { ItineraryProvider } from '../context/ItineraryContext'

export default function App({ Component, pageProps }) {
  return (
    <ItineraryProvider>
      <Component {...pageProps} />
    </ItineraryProvider>
  )
}