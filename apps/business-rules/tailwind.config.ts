import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        banorte: {
          red: '#EB0029',
          gray: '#5B6670',
          lightgray: '#EBF0F2',
        },
      },
      fontFamily: {
        sans: ['Gotham', 'system-ui', 'sans-serif'],
      },
    },
  },
  // Important: Disable preflight to avoid conflicts with Material-UI
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
export default config
