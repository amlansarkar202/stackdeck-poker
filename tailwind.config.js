/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        poker: {
          'green-dark': '#0a1f12',
          'green': '#143820',
          'green-felt': '#194a2b',
          'green-light': '#23633b',
          'gold': '#f59e0b',
          'gold-light': '#fbbf24',
          'gold-dark': '#b45309',
          'chip-red': '#dc2626',
          'chip-blue': '#2563eb',
          'chip-green': '#16a34a',
          'chip-black': '#1f2937',
          'chip-purple': '#9333ea',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-up': 'scaleUp 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
