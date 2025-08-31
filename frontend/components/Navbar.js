import { useState, useEffect } from 'react'  
import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsLoggedIn(!!token);
  }, []);

  return (
    <nav className="flex justify-between items-center px-6 py-4 shadow-md">
      {/* Left Logo */}
      <Link href="/">
        <div className="flex items-center space-x-2">
          <Image src="/TMT_icon.jpg" alt="TailorMyTaipei Logo" width={34} height={34} />
          <span className="font-bold text-xl text-green-800">TailorMyTaipei</span>
        </div>
      </Link>

      {/* Right */}
      <div className="flex items-center gap-6 text-green-900 font-medium">
        <Link className="hover:text-green-600" href="/">Home</Link>
        <Link className="hover:text-green-600" href="/explore">Explore</Link>
        {isLoggedIn ? (
          <>
            <Link className="hover:text-green-600" href="/my-trips">My Trips</Link>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="hover:text-green-600" href="/login">Login</Link>
            <Link className="hover:text-green-600" href="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}