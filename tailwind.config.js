/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  darkMode: "class",

  theme: {
    extend: {
      colors: {
        light: {
          background: "#FFF8F7",
          surface: "#FFE3E0",
          primary: "#EF6351",
          secondary: "#F38375",
          accent: "#F7A399",
          text: "#4A2A26",
          border: "#FBC3BC",
          muted: "#FFE3E0",
          mutedText: "#7A4B44",
        },

        dark: {
          background: "#0C0807",
          surface: "#140D0C",
          primary: "#EF6351",
          secondary: "#F38375",
          accent: "#F7A399",
          text: "#F5EBEA",
          border: "#291917",
          muted: "#1C1211",
          mutedText: "#B59995",
        },

        background: "#FFF8F7",
        surface: "#FFE3E0",
        primary: "#EF6351",
        secondary: "#F38375",
        accent: "#F7A399",
        text: "#4A2A26",
        border: "#FBC3BC",
        muted: "#FFE3E0",
        mutedText: "#7A4B44",

        brand: {
          50: "#FFF8F7",
          100: "#FFE3E0",
          200: "#FBC3BC",
          300: "#F7A399",
          400: "#F38375",
          500: "#EF6351",
          600: "#D95544",
          700: "#B94739",
          800: "#8F382D",
          900: "#6B2A22",
          950: "#451915",
        },
      },

      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
      },
    },
  },

  plugins: [],
};