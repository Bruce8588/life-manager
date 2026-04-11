/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#FFF9F0',
          100: '#FFF3E0',
          200: '#FFE4C4',
          300: '#FFD4A3',
          400: '#FFC082',
          500: '#FFAB40',
          600: '#FF9800',
          700: '#FB8C00',
          800: '#F57C00',
          900: '#EF6C00',
        }
      }
    },
  },
  plugins: [],
}
