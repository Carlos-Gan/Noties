/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'noties-sidebar': '#1e1e1e',
        'noties-bg': '#3d3d3d',
        'noties-input': '#4d4d4d',
      }
    },
  },
  plugins: [],
}