import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#17221f',
        paper: '#f7f2e8',
        plum: '#5f315e',
        coral: '#ee765d',
        mint: '#c9e6d6',
      },
      boxShadow: {
        lift: '0 20px 55px rgba(50, 38, 31, 0.10)',
      },
    },
  },
  plugins: [],
};

export default config;
