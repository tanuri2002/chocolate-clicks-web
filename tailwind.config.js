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
        'dark-950': '#0a0a0a',
        'dark-900': '#111111',
        'dark-800': '#1a1a1a',
        'dark-700': '#222222',
        'dark-600': '#2a2a2a',
        'accent': '#f59e0b',     // orange-500
        'success': '#22c55e',
        'warning': '#eab308',
        'danger': '#ef4444',
      }
    },
  },
  plugins: [],
}
