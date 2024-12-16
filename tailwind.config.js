const path = require('path')

const resolve = p => {
  return path.resolve(__dirname, p)
}

/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  mode: 'jit',
  darkMode: 'class',
  important: true,
  content: ['./index.html', './src/**/*.vue'].map(resolve),
  theme: {
    extend: {
      transitionProperty: {
        height: 'height'
      },
      colors: {
        page: '#f6f6f6',
        color: {
          primary: '#4F4F4F',
          desc: '#4F4F4F',
          dark: '#525252',
          extra: '#A5A5A5',
          input: '#F3F3F3',
          upload: '#DADADA',
          placeholder: '#C4C4C7',
          switch: '#DADADA'
        },
        primary: '#1352C5',
        action: '#c0f3e1'
      }
    }
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
}
