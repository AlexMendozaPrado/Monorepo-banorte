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
          "red-hover": "#E30028",
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
          critical: "#EB0029",
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
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "zoom-in-95": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in-from-bottom-4": "slide-in-from-bottom 0.3s ease-out",
        "zoom-in-95": "zoom-in-95 0.2s ease-out",
      },
    },
  },
  plugins: [],
}
