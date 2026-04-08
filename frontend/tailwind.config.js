/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#49559F',
          50: '#f2f4fb',
          100: '#e5e9f7',
        },
      },
      borderRadius: {
        card: '1rem',
      },
      boxShadow: {
        card: '0 6px 20px rgba(16, 24, 40, 0.06)',
      },
    },
  },
  plugins: [],
};
