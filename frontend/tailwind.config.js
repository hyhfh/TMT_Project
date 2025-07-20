/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
   extend: {  // extend 裡加入自定義動畫
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        }
      },
      animation: {
        "fade-in": "fadeIn 1s ease-in-out",
      }
    },
  },
  plugins: [],
}