import { useEffect, useState } from "react";
import TripCard from "../components/TripCard";
import Navbar from "../components/Navbar";

export default function MyTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  console.log("🔑 token in /my-trips:", token); 

  useEffect(() => {
  const storedToken = localStorage.getItem("token");
  if (!storedToken) {
    window.location.href = "/login";
  } else {
    setToken(storedToken); 
  }
}, []);

  useEffect(() => {
    if (token) {
      fetchTrips(token);
    }
  }, [token]);

  const fetchTrips = async () => {
    console.log("token for fetchTrips:", token);
    try {
      const res = await fetch("http://localhost:8000/trips", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("fetch status:", res.status); 
      if (!res.ok) throw new Error("Failed to fetch trips");
      const data = await res.json();
      console.log("fetchTrips result:", data); 
      setTrips(data);
    } catch (err) {
      console.error("fetchTrips error:", err); 
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tripId) => {
    console.log("Deleting trip:", tripId);
    console.log("Token used for deletion:", token);  
    try {
      const res = await fetch(`http://localhost:8000/trips/${tripId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Delete failed");
      setTrips((prev) => prev.filter((trip) => trip.id !== tripId));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-green-800">My Trips</h1>
        {loading && <p className="text-gray-500">Loading trips...</p>}
        {!loading && trips.length === 0 && (
          <p className="text-gray-600 italic">You haven't saved any trips yet.</p>
        )}
        {error && <p className="text-red-500">Error: {error}</p>}
        {trips.length === 0 && !loading && <p>No trips found.</p>}
        <div className="space-y-6">
          {trips.map((trip) => (
            <div key={trip.id} className="border rounded-xl p-4 shadow">
              <TripCard trip={trip} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}