import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 shadow-md">
      <Link href="/">
        <div className="flex items-center space-x-2">
          <Image src="/TMT_icon.jpg" alt="TailorMyTaipei Logo" width={34} height={34} />
          <span className="font-bold text-xl text-green-800">TailorMyTaipei</span>
        </div>
      </Link>
      <div className="space-x-6 text-green-900 font-medium">
        <Link href="/">Home</Link>
        <Link href="/explore">Explore</Link>
        <Link href="/trips">My Trips</Link>
        <Link href="/about">About</Link>
        <Link href="/login">Log in</Link>
      </div>
    </nav>
  )
}