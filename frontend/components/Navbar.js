import { useState, useEffect } from 'react'  // 這樣才能讓 React 知道你要用 useState 和 useEffect
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
      {/* 左側 Logo */}
      <Link href="/">
        <div className="flex items-center space-x-2">
          <Image src="/TMT_icon.jpg" alt="TailorMyTaipei Logo" width={34} height={34} />
          <span className="font-bold text-xl text-green-800">TailorMyTaipei</span>
        </div>
      </Link>

      {/* 右側導覽列 */}
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


//     <nav className="flex justify-between items-center px-6 py-4 shadow-md">
//       <Link href="/">
//         <div className="flex items-center space-x-2">
//           <Image src="/TMT_icon.jpg" alt="TailorMyTaipei Logo" width={34} height={34} />
//           <span className="font-bold text-xl text-green-800">TailorMyTaipei</span>
//         </div>
//       </Link>
//       <div className="space-x-6 text-green-900 font-medium"></div>
//       <Link href="/">Home</Link>
//       <Link href="/explore">Explore</Link>
//       {isLoggedIn ? (
//         <>
//           <Link href="/my-trips">My Trips</Link>
//           <button onClick={() => {
//             localStorage.removeItem("token");
//             window.location.href = "/";
//           }}>Logout</button>
//         </>
//       ) : (
//         <>
//           <Link href="/login">Login</Link>
//           <Link href="/register">Register</Link>
//         </>
//       )}
//     </nav>
//   );
// }


// // export default function Navbar() {
// //   return (
//     <nav className="flex justify-between items-center px-6 py-4 shadow-md">
//       <Link href="/">
//         <div className="flex items-center space-x-2">
//           <Image src="/TMT_icon.jpg" alt="TailorMyTaipei Logo" width={34} height={34} />
//           <span className="font-bold text-xl text-green-800">TailorMyTaipei</span>
//         </div>
//       </Link>
//       <div className="space-x-6 text-green-900 font-medium">
// //         <Link href="/">Home</Link>
// //         <Link href="/explore">Explore</Link>
// //         <Link href="/trips">My Trips</Link>
// //         <Link href="/about">About</Link>
// //         <Link href="/login">Log in</Link>
// //       </div>
// //     </nav>
// //   )
// // }
