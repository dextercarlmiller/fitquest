/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        game: {
          bg: '#040f04',
          card: '#0a1a0a',
          border: '#1a3a1a',
          green: '#4ade80',
          lime: '#a3e635',
          yellow: '#facc15',
          red: '#f87171',
          grey: '#374151',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
      },
      animation: {
        'float-up': 'floatUp 1.5s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'fill-bar': 'fillBar 0.8s ease-out forwards',
      },
      keyframes: {
        floatUp: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-80px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px #4ade80, 0 0 16px #4ade80' },
          '50%': { boxShadow: '0 0 20px #4ade80, 0 0 40px #4ade80' },
        },
        fillBar: {
          '0%': { width: '0%' },
        },
      },
    },
  },
  plugins: [],
}
