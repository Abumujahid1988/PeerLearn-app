// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',        // Indigo-600: Professional, tech-forward
        primaryDark: '#4338CA',    // Indigo-700: Darker for hover/active states
        accent: '#10B981',         // Emerald-500: Fresh, growth-oriented accent
        accentDark: '#059669',     // Emerald-600: Darker for hover
        background: '#F8FAFC',     // Slate-50: Clean, light background
        surface: '#F1F5F9',        // Slate-100: Card backgrounds
        footer: '#1E293B',         // Slate-800: Dark footer
      },
    },
  },
  plugins: [],
};
