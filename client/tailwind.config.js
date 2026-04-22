export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#2563eb',
        accent:  '#7c3aed',
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.10)",
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%':   { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in':      'fade-in 0.4s ease-out forwards',
        'fade-in-down': 'fade-in-down 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
