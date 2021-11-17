const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  mode: 'jit',

  prefix: 'tw-',
  important: true,
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',

  theme: {
    extend: {
      screens: {
        '3xl': '1920px',
      },

      colors: {
        inherit: 'inherit',

        primary: {
          DEFAULT: 'var(--color-primary)',
        },

        secondary: {
          DEFAULT: 'var(--color-secondary)',
        },

        light: 'var(--color-light)',

        gold: {
          DEFAULT: 'var(--color-gold)',
          light: 'var(--color-gold-light)',
          lighter: 'var(--color-gold-lighter)',
          dark: 'var(--color-gold-dark)',
          darker: 'var(--color-gold-darker)',
        },
      },

      spacing: {
        84: '21rem',
        88: '22rem',
      },

      minWidth: (theme) => theme('spacing'),

      maxWidth: (theme) => ({
        ...theme('spacing'),
        '8xl': '88rem',
        '9xl': '96rem',
        '10xl': '104rem',
      }),

      minHeight: (theme) => theme('spacing'),

      maxHeight: (theme) => ({
        ...theme('spacing'),
        '8xl': '88rem',
        '9xl': '96rem',
        '10xl': '104rem',
      }),

      backgroundColor: (theme) => ({
        main: theme('colors.gray.100'),
      }),

      borderWidth: {
        thin: 'thin',
      },

      fontFamily: {
        sans: ['Microsoft YaHei', ...defaultTheme.fontFamily.sans],
      },
    },
  },

  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/typography'),
  ],
};
