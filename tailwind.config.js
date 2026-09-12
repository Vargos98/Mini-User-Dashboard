/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          muted: 'rgb(var(--ink-muted) / <alpha-value>)',
          card: 'rgb(var(--ink-card) / <alpha-value>)',
          border: 'rgb(var(--ink-border) / <alpha-value>)',
        },
        fg: {
          DEFAULT: 'rgb(var(--fg) / <alpha-value>)',
          muted: 'rgb(var(--fg-muted) / <alpha-value>)',
          subtle: 'rgb(var(--fg-subtle) / <alpha-value>)',
          faint: 'rgb(var(--fg-faint) / <alpha-value>)',
        },
        ember: {
          DEFAULT: 'rgb(var(--ember) / <alpha-value>)',
          2: 'rgb(var(--ember-2) / <alpha-value>)',
          soft: 'rgb(var(--ember-soft) / <alpha-value>)',
        },
      },
      boxShadow: {
        glow: '0 0 48px rgb(var(--ember) / 0.16)',
      },
    },
  },
  plugins: [],
}
