/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#090a0f',
        cardBg: 'rgba(20, 22, 33, 0.65)',
        borderBg: 'rgba(255, 255, 255, 0.08)',
        accentCyan: '#06b6d4',
        accentTeal: '#14b8a6',
        accentAmber: '#f59e0b',
        accentRed: '#ef4444',
      },
      boxShadow: {
        glowCyan: '0 0 20px rgba(6, 182, 212, 0.15)',
        glowTeal: '0 0 20px rgba(20, 184, 166, 0.15)',
        glowAmber: '0 0 20px rgba(245, 158, 11, 0.15)',
        glowRed: '0 0 20px rgba(239, 68, 68, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-flow': 'glowFlow 8s ease infinite',
      },
      keyframes: {
        glowFlow: {
          '0%, 100%': { filter: 'hue-rotate(0deg)' },
          '50%': { filter: 'hue-rotate(60deg)' },
        }
      }
    },
  },
  plugins: [],
}
