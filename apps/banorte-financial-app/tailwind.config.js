const { banortePreset } = require('@banorte/ui/tailwind/preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  presets: [banortePreset],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [],
}
