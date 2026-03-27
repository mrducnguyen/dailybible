/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#4A3728',
        'primary-dark': '#2D1F16',
        advent: '#6B3A8A',
        ordinary: '#2D6A4F',
        gold: '#B8860B'
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif']
      }
    }
  },
  plugins: []
};
