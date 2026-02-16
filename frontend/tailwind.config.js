/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#4F46E5',
          600: '#4338CA',
          700: '#3730A3',
        },
        accent: {
          500: '#10B981',
        },
        background: {
          50: '#F8FAFC',
        },
        surface: {
          DEFAULT: '#FFFFFF',
        },
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
        },
        error: {
          500: '#EF4444',
          600: '#DC2626',
        },
        warning: {
          500: '#F59E0B',
        },
        success: {
          500: '#10B981',
        },
      },
      boxShadow: {
        card: '0 8px 24px rgba(15, 23, 42, 0.06)',
      },
      transitionTimingFunction: {
        subtle: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
