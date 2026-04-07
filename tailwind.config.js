/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Nunito','sans-serif'] },
      colors: {
        brand: { purple:'#5B52C2', coral:'#C97A7A' },
      },
    },
  },
  plugins: [],
}
