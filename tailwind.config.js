/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // هنا حددنا درجات اللون الأزرق الخاصة بك
        // الآن أي كود bg-blue-600 سيأخذ لونك المفضل تلقائياً
        blue: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0e395c', // لونك الأساسي (العناوين والأزرار)
          700: '#0b2d49', // لون عند الوقوف بالمؤشر (Hover)
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        sans: ['Zain', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
