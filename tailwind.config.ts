import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1A1A2E',
        'navy-dark': '#0D0D1F',
        'navy-mid': '#12122A',
        'navy-light': '#232342',
        gold: '#C9A84C',
        'gold-light': '#E8C96C',
        sidebar: '#111128',
      },
    },
  },
  plugins: [],
};
export default config;
