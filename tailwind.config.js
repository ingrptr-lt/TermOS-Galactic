/** @type {import('tailwindcss').Config} */
module.exports = {
  // IMPORTANT: This tells Tailwind where your HTML files are so it can generate the CSS
  content: [
    "./public/**/*.{html,js}",
    "./src/**/*.{html,js}",
    "./index.html" 
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          purple: '#a855f7',
          cyan: '#06b6d4',
        }
      },
      fontFamily: {
        header: ['Orbitron', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
