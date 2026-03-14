/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for our dashboard
        'dashboard-bg': '#121212',
        'dashboard-card': '#1e1e1e',
        'dashboard-accent': '#3b82f6', // blue-500
        'status-ok': '#10b981', // green-500
        'status-warn': '#f59e0b', // amber-500
        'status-critical': '#ef4444', // red-500
      },
    },
  },
  plugins: [],
}