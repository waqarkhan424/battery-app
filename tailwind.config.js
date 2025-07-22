/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#22d3ee", // cyan-400
        secondary: "#94a3b8", // slate-400
        background: "#0f172a", // slate-900
        surface: "#1e293b", // slate-800
      },
    },
  },
  plugins: [],
};
