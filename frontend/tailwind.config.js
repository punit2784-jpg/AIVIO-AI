/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
        },
        navy: {
          800: '#0f172a',
          900: '#0b1120',
          950: '#020617',
        },
        pharma: {
          teal: '#0d9488',
          accent: '#14b8a6',
          danger: '#dc2626',
          warning: '#f59e0b',
          success: '#10b981',
          surface: '#f8fafc',
          border: '#e2e8f0',
        }
      }
    },
  },
  plugins: [],
}

