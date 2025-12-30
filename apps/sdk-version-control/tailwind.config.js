const { banortePreset } = require('@banorte/ui/tailwind/preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  presets: [banortePreset],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Extensiones adicionales específicas de esta app
        status: {
          critical: "#EB0029",
        }
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
