/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terra: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          dark: '#0B132B',
          card: '#1C2541',
          accent: '#48CAE4',
          hazard: '#EF4444',
          warn: '#F59E0B',
          info: '#3B82F6'
        }
      }
    },
  },
  plugins: [],
}
