import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const validatePassword = (password) => {
    const lengthValid = password.length >= 6 && password.length <= 14;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    return lengthValid && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage("Password does not meet the requirements.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        router.push('/login');
      } else {
        const data = await response.json();
        setErrorMessage(data.detail || "Registration failed.");
      }
    } catch (error) {
      setErrorMessage("Something went wrong.");
    }
  };

    return (
    <div>
        <Navbar />
        <div className="max-w-md mx-auto p-6 mt-8 bg-white rounded-xl shadow-md">
         <h2 className="text-2xl font-bold text-green-800 mb-4">Register</h2>

            <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded mb-4 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />

            <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border border-gray-300 rounded mb-1 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />

            <p className="text-xs text-gray-500 mb-3">
            Password must be <span className="font-medium">6–14 characters</span> and include{" "}
            <span className="font-medium">uppercase and lowercase letters, numbers, and special characters</span>.
            </p>

            <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-2 border border-gray-300 rounded mb-4 text-sm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {errorMessage && (
            // <p className="text-sm text-red-600 mb-4">{errorMessage}</p>
            <p className="text-sm text-red-600 mb-4">{errorMessage?.msg || "Something went wrong."}</p>

            )}

            <button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-sm font-medium transition duration-200"
            onClick={handleRegister}
            >
            Register
            </button>
        </div>
    </div>
    );
    }



// export default function Register() {
//     const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [error, setError] = useState('');

//   const validatePassword = (pw) => {
//     const lengthValid = pw.length >= 6 && pw.length <= 14;
//     const hasUppercase = /[A-Z]/.test(pw);
//     const hasLowercase = /[a-z]/.test(pw);
//     const hasNumber = /[0-9]/.test(pw);
//     const hasSpecialChar = /[^A-Za-z0-9]/.test(pw);
//     return lengthValid && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
//   };

//   const handleRegister = async () => {
//     if (password !== confirmPassword) {
//       setError('❌ Passwords do not match.');
//       return;
//     }

//     if (!validatePassword(password)) {
//       setError('❌ Password must be 6-14 characters, include upper/lowercase, number, and special symbol.');
//       return;
//     }

//     // 清除錯誤
//     setError('');

//     try {
//       const response = await fetch('http://localhost:8000/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();
//       if (response.ok) {
//         alert('✅ Registered successfully!');
//         router.push('/login');
//       } else {
//         setError(`❌ ${data.detail || 'Registration failed.'}`);
//       }
//     } catch (err) {
//       setError('❌ Server error.');
//     }
//   };
// }


//   return (
//     <div>
//         <Navbar />
//         <div className="max-w-md mx-auto p-6 mt-8 bg-white rounded-xl shadow-md">
//         <h2 className="text-2xl font-bold text-green-800 mb-4">Register</h2>

//         <input
//             type="email"
//             placeholder="Email"
//             className="w-full p-2 border rounded mb-3"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//         />

//        <input
//             type="password"
//             placeholder="Password"
//             className="w-full p-2 border rounded mb-1"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//         />
//         <p className="text-sm text-gray-500 mb-3">
//             Password must be 6–14 characters and include <span className="font-medium">uppercase and lowercase letters, numbers, and special characters</span>.
//         </p>

//         <input
//             type="password"
//             placeholder="Confirm Password"
//             className="w-full p-2 border rounded mb-4"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//         />

//         {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

//         <button
//             onClick={handleRegister}
//             className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
//         >
//             Register
//         </button>
//         </div>
//     </div>
//   );
// }