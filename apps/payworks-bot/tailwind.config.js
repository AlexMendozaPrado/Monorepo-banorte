/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        banorte: {
          red: '#EB0029',
          dark: '#323E48',
          secondary: '#5B6670',
          bg: '#EBF0F2',
          surface: '#F4F7F8',
          success: '#6CC04A',
          warning: '#FFA400',
          error: '#EB0029',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      borderRadius: {
        btn: '4px',
        input: '6px',
        card: '8px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
        hover: '0 6px 12px rgba(0,0,0,0.20)',
      },
    },
  },
  plugins: [],
};
