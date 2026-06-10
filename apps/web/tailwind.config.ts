import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#ff385c', dark: '#e71d45' },
        text: { DEFAULT: '#222', muted: '#666' },
        line: '#ddd',
        surface: { DEFAULT: '#fff', bg: '#f8f8f8' },
        chip: { open: '#1d9d74', closed: '#8f95a4' },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      maxWidth: {
        'container': '1360px',
      },
    },
  },
  plugins: [],
};

export default config;
