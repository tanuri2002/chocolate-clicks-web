/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'smores-orange': '#ff9800',
        'smores-orange-hover': '#ffb733',
      }
    },
  },
  plugins: [],
}
