/** @type {import('tailwindcss').Config} */
export default {
  // Включаем ручное переключение темной темы через добавление класса 'dark'
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Официальные цвета СПбГЭТУ «ЛЭТИ»
        leti: '#05336e',        // Фирменный синий
        'leti-gold': '#bb8d54', // Фирменный золотой/бронзовый
        'leti-gray': '#6d6e71'  // Фирменный серый
      }
    },
  },
  plugins: [],
}