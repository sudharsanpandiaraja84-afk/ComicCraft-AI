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
        forge: {
          bg: '#080C14',
          surface: '#0E1424',
          card: '#141C30',
          cardHover: '#1B2642',
          border: '#233052',
          accent: '#F59E0B',      // Forge Amber
          primary: '#6366F1',     // Indigo / Gemini purple
          violet: '#8B5CF6',      // Creative Violet
          cyan: '#06B6D4',        // High-tech Cyan
          emerald: '#10B981',     // Quality Pass Emerald
          rose: '#F43F5E',        // Dynamic Rose
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Merriweather', 'Georgia', 'serif'],
        cinzel: ['Cinzel', 'serif'],
      },
      boxShadow: {
        'glow-indigo': '0 0 35px -5px rgba(99, 102, 241, 0.35)',
        'glow-amber': '0 0 30px -5px rgba(245, 158, 11, 0.35)',
        'glow-violet': '0 0 35px -5px rgba(139, 92, 246, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
      }
    },
  },
  plugins: [],
}
