/** @type {import('tailwindcss').Config} */
const c = (v) => `rgb(var(--${v}) / <alpha-value>)`;
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  safelist: ["scaled"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        bg: c("bg"),
        surface: c("surface"),
        surface2: c("surface2"),
        line: c("line"),
        ink: c("ink"),
        muted: c("muted"),
        brand: c("brand"),
        "brand-ink": c("brand-ink"),
        good: c("good"),
        danger: c("danger"),
      },
    },
  },
  plugins: [],
};
