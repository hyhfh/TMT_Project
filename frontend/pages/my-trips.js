import { useEffect, useState } from "react";
import TripCard from "../components/TripCard";
import Navbar from "../components/Navbar";

export default function MyTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [token, setToken] = useState(null);

  // const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  console.log("🔑 token in /my-trips:", token);  // 👈 加這行

  useEffect(() => {
  const storedToken = localStorage.getItem("token");
  if (!storedToken) {
    window.location.href = "/login";
  } else {
    setToken(storedToken); // ✅ 會觸發下一個 useEffect
  }
}, []);

  useEffect(() => {
    if (token) {
      fetchTrips(token);
    }
  }, [token]);

  const fetchTrips = async () => {
    console.log("📦 token for fetchTrips:", token);
    // 如果 token === null，會導致沒有授權，後端拒絕回傳 401 Unauthorized 或 403 Forbidden
    try {
      // const res = await fetch("http://localhost:8000/trips/trips", {
      const res = await fetch("http://localhost:8000/trips", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("🔎 fetch status:", res.status); // 加這行
      if (!res.ok) throw new Error("Failed to fetch trips");
      const data = await res.json();
      console.log("✅ fetchTrips result:", data); // 加這行
      setTrips(data);
    } catch (err) {
      console.error("❌ fetchTrips error:", err); // 加這行
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tripId) => {
    console.log("🧹 Deleting trip:", tripId);
    console.log("🔐 Token used for deletion:", token);  // ← 加這行看 token 有沒有送出
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

  // if (!token) {
  //   // 如果沒 token，可能還沒登入，導向登入頁
  //   window.location.href = "/login";
  //   }

  // useEffect(() => {
  //   fetchTrips();
  // }, []);

// ✅ 第一次載入時從 localStorage 拿 token
//   useEffect(() => {
//   const token = localStorage.getItem("token");
//   if (!token) {
//     window.location.href = "/login";
//   } else {
//     setToken(token);
//   }
// }, []);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     window.location.href = "/login";
  //   } else {
  //     setToken(token);
  //     // fetchTrips(token); // 👈 登入後就直接呼叫 trips
  //   }
  // }, []);

  // // ✅ 等 token 有值時再 fetch trips
  // useEffect(() => {
  //   if (token) {
  //     fetchTrips();
  //   }
  // }, [token]);

  return (
    <div>
      <Navbar />
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-green-800">My Trips</h1>
        {loading && <p>Loading trips...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {trips.length === 0 && !loading && <p>No trips found.</p>}

        <div className="space-y-6">
          {trips.map((trip) => (
            <div key={trip.id} className="border rounded-xl p-4 shadow">
              <TripCard trip={trip} onDelete={handleDelete} />
              {/* <TripCard trip={trip} /> */}
              {/* <button
                className="mt-2 px-4 py-1 text-sm bg-red-500 text-white rounded"
                onClick={() => handleDelete(trip.id)}
              >
                Delete
              </button> */}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}