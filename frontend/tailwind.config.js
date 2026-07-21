/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        give: {
          DEFAULT: '#f97316', // Orange-500
          bg: '#ffedd5',      // Orange-100
          light: '#fdba74',   // Orange-300
        },
        want: {
          DEFAULT: '#f43f5e', // Rose-500
          bg: '#ffe4e6',      // Rose-100
        },
        ink: {
          DEFAULT: '#1E1A17',
          soft: '#6B6158',
        },
        bgwarm: '#F2F0EC',
        surface: {
          DEFAULT: '#FAFAF7',
          raised: '#FFFFFF',
        }
      },
      fontFamily: {
        logo: ['Fraunces', 'Georgia', 'serif'],
        display: ['"Geist"', 'sans-serif'],
        body: ['"Geist Mono"', 'monospace'],
        sach: ['"Nunito Sans"', 'sans-serif'],
        kam: ['Kameron', 'Georgia', 'serif'],
        rob: ['Roboto', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
