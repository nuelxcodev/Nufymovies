/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  safelist: ["scaled"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: { sans: ["var(--font-poppins)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
