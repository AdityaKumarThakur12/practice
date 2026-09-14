/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        iq: {
          primary: '#0d9488',
          'primary-dark': '#0f766e',
          'primary-light': '#14b8a6',
          accent: '#0369a1',
          bg: '#f8fafc',
          surface: '#ffffff',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
