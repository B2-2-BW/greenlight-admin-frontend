/** @type {import('tailwindcss').Config} */
const { heroui } = require('@heroui/react');

export default {
  content: ['./src/**/*.{html,js,jsx}', './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },

  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: '#20814C',
              foreground: '#FFFFFF',
            },
            focus: '#20814C',
          },
        },
      },
    }),
  ],
};
