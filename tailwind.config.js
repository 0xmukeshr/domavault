/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'jetbrains': ['JetBrains Mono', 'monospace'],
        'orbitron': ['Orbitron', 'sans-serif'],
        'space-mono': ['Space Mono', 'monospace'],
        'michroma': ['Michroma', 'sans-serif'],
      },
      colors: {
        'neon-green': '#00ff41',
        'neon-blue': '#00d4ff',
        'neon-purple': '#bf00ff',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 255, 65, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 255, 65, 0.8), 0 0 30px rgba(0, 255, 65, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};