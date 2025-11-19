// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        primaryDark: '#1D4ED8',
        accent: '#38BDF8',
        background: '#F9FAFB',
        footer: '#0F172A',
        // ocean as numeric scale + DEFAULT
        ocean: {
          50:  '#e9f6ff',
          100: '#cfeeff',
          200: '#b3e5ff',
          300: '#82d6ff',
          400: '#4cc0ff',
          500: '#0077B6',
          600: '#00649a',
          700: '#025078',
          800: '#023a57',
          900: '#02283a',
          DEFAULT: '#0077B6'
        }
      },
    },
  },
  plugins: [],
};
