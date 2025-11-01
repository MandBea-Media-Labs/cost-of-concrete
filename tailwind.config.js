/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,vue,ts}',
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    fontFamily: {
      heading: ['ObjectSans', 'sans-serif'],
      sans: ['Inter', 'sans-serif'],
      tight: ['Inter Tight', 'sans-serif'],
    },
    extend: {
      maxWidth: {
        '8xl': '1580px',
      },
      colors: {
        neutral: {
          50: '#ffffff',
          100: '#f7f7f7',
          200: '#eeeeef',
          300: '#cdcdd3',
          400: '#666666',
          500: '#535364',
          600: '#2a2a33',
          700: '#111116',
          800: '#000000',
        },
        blue: {
          50: '#e3f2fd',
          100: '#65b4ff',
          200: '#1877f2',
          300: '#0000ee',
          400: '#0041d9',
          500: '#0041d9',
          600: '#003399',
        },
        red: {
          100: '#d03c0b',
          500: '#d03c0b',
        },
      },
    },
  },
  plugins: [],
}

