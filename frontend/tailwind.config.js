/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a1a', // Dark background
        secondary: '#b91c1c', // Red accent
        accent: '#d4af37', // Gold accent
        text: '#e5e7eb', // Light text
      },
    },
  },
  plugins: [],
}