import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
          body: new URLSearchParams({
            username: email,
            password: password,
          }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      console.log("🔐 Login success, token:", data.access_token);
      router.push('/');
    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <div>
      <Navbar />
      <main className="p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-green-800">Login</h1>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Login
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Don't have an account?{' '}
            <Link href="/register" className="text-green-700 hover:underline">
              &nbsp;Sign up here
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
