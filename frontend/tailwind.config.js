/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        surface: {
          950: '#07090d',
          900: '#0c0f14',
          800: '#131820',
          700: '#1a2230',
          600: '#243044',
          500: '#334155',
        },
      },
      fontFamily: {
        display: ['"Syne"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.25)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.3), 0 20px 40px rgba(0,0,0,0.35)',
        glow: '0 0 40px rgba(251, 191, 36, 0.15)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh': 'radial-gradient(at 40% 20%, rgba(251,191,36,0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(99,102,241,0.06) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(16,185,129,0.05) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
};
