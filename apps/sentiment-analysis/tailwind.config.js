/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    // Include workspace packages
    "../../packages/landing-page/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Banorte Design System Colors
        primary: "#EBF0F2",
        surface1: "#FFFFFF",
        surface2: "#F8F9FA",

        // Text Colors (Banorte Official)
        textPrimary: "#323E48",
        textSecondary: "#5B6670",
        textDisabled: "#7B868C",

        // Interactive Elements
        banorteRed: "#EB0029",
        banorteRedHover: "#E30028",

        // Feedback Colors
        success: "#6CC04A",
        warning: "#FFA400",
        error: "#FF671B",

        // Borders and Dividers
        borderDashed: "#D1D5DB",
        borderLight: "#E5E7EB",
      },
      fontFamily: {
        sans: ["Spline Sans", "Noto Sans", "sans-serif"],
      },
      borderRadius: {
        full: "9999px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};

