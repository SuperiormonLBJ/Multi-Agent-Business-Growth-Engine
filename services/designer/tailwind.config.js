/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        theme: {
          primary: 'rgb(var(--color-primary) / <alpha-value>)',
          'primary-dark': 'rgb(var(--color-primary-dark) / <alpha-value>)',
          'primary-light': 'rgb(var(--color-primary-light) / <alpha-value>)',
          'gradient-from': 'rgb(var(--color-gradient-from) / <alpha-value>)',
          'accent-bg': 'rgb(var(--color-accent-bg) / <alpha-value>)',
        },
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
