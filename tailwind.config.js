/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
      borderRadius: {
        '4xl': '2rem',
      },
      colors: {
        neutral: {
          50: '#ffffff',
          100: '#f7f7f7',
          200: '#eeeeef',
          250: '#d9d9d9',
          300: '#cdcdd3',
          400: '#666666',
          500: '#535364',
          600: '#2a2a33',
          700: '#111116',
          800: '#000000',
        },
        blue: {
          25: '#edf2fc',
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
      keyframes: {
        slideDownAndFade: {
          from: { opacity: '0', transform: 'translateY(-2px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeftAndFade: {
          from: { opacity: '0', transform: 'translateX(2px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideUpAndFade: {
          from: { opacity: '0', transform: 'translateY(2px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideRightAndFade: {
          from: { opacity: '0', transform: 'translateX(-2px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        slideDownAndFade: 'slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideLeftAndFade: 'slideLeftAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideUpAndFade: 'slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideRightAndFade: 'slideRightAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
}

