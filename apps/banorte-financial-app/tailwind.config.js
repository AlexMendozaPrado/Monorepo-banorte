/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        banorte: {
          red: "#EB0029",
          gray: "#5B6670",
          dark: "#323E48",
          bg: "#EBF0F2",
          light: "#F4F7F8",
          white: "#FCFCFC",
        },
        status: {
          success: "#6CC04A",
          warning: "#FFA400",
          alert: "#FF671B",
        }
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
        display: ['Gotham', 'Montserrat', 'sans-serif'],
      },
      borderRadius: {
        'btn': '4px',
        'input': '6px',
        'card': '8px',
      },
      boxShadow: {
        'card': '0 3px 6px rgba(0,0,0,0.16)',
        'hover': '0 6px 12px rgba(0,0,0,0.20)',
      },
    },
  },
  plugins: [],
}
