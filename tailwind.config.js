/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0e395c',
          700: '#0b2d49',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        // ✅ نخلي Tailwind يقرا من المتغير بتاعنا
        sans: ['var(--app-font)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
