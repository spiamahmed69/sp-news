/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: {
    colors: { brand: { DEFAULT: '#C8102E', dark: '#9A0B22', light: '#FDECEF' }, ink: '#111827' },
    fontFamily: { bengali: ['"Noto Serif Bengali"','"Noto Sans Bengali"','serif'], sans: ['"Noto Sans Bengali"','system-ui','sans-serif'] },
  }},
  plugins: [],
};
