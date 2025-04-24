/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Your custom color scheme
        estate: {
          50: "#e0e0ef",
          100: "#b7b7d9",
          200: "#8f8fc4",
          300: "#6868ac",
          400: "#44448e",
          500: "#272757",
          600: "#0e0e27",
          700: "#0a0a1f",
          800: "#060617",
          900: "#03030f",
        },
        // Token contract colors from SVG
        token: {
          blue: "#2196f3",
          lightblue: "#e3f2fd",
          green: "#4caf50",
          lightgreen: "#e8f5e9",
          orange: "#ff9800",
          lightorange: "#fff3e0",
          purple: "#9c27b0",
          lightpurple: "#f3e5f5",
          red: "#f44336",
          lightred: "#ffebee",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Montserrat", "sans-serif"],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          "primary": "#44448e",
          "primary-focus": "#272757",
          "primary-content": "#ffffff",
          "secondary": "#f44336",
          "accent": "#9c27b0",
          "neutral": "#272757",
          "base-100": "#ffffff",
          "base-200": "#f8f9fa",
          "base-300": "#e0e0ef",
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          "primary": "#6868ac",
          "primary-focus": "#8f8fc4",
          "primary-content": "#ffffff",
          "secondary": "#f44336",
          "accent": "#9c27b0",
          "neutral": "#0e0e27",
          "base-100": "#0e0e27",
          "base-200": "#272757",
          "base-300": "#44448e",
        },
      },
    ],
    darkTheme: "dark",
  },
};