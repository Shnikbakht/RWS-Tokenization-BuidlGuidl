/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [require("daisyui")],
  darkMode: ["selector", "[data-theme='dark']"],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#4f46e5", // Indigo 600 - Primary brand color
          "primary-content": "#ffffff", // White text on primary
          secondary: "#1e40af", // Blue 800 - Secondary brand color
          "secondary-content": "#ffffff", // White text on secondary
          accent: "#6366f1", // Indigo 500 - Accent color
          "accent-content": "#ffffff", // White text on accent
          neutral: "#1f2937", // Gray 800 - Neutral dark
          "neutral-content": "#ffffff", // White text on neutral
          "base-100": "#ffffff", // White - Base background
          "base-200": "#f3f4f6", // Gray 100 - Darker base for sections
          "base-300": "#e5e7eb", // Gray 200 - Additional section color
          "base-content": "#1f2937", // Gray 800 - Text color
          info: "#3b82f6", // Blue 500 - Info color
          success: "#10b981", // Emerald 500 - Success color
          warning: "#f59e0b", // Amber 500 - Warning color
          error: "#ef4444", // Red 500 - Error color
          "--rounded-btn": "0.5rem", // Rounded button style (more professional)
        },
      },
      {
        dark: {
          primary: "#4f46e5", // Indigo 600 - Primary brand color
          "primary-content": "#ffffff", // White text on primary
          secondary: "#1e40af", // Blue 800 - Secondary brand color
          "secondary-content": "#ffffff", // White text on secondary
          accent: "#6366f1", // Indigo 500 - Accent color
          "accent-content": "#ffffff", // White text on accent
          neutral: "#f3f4f6", // Gray 100 - Neutral light
          "neutral-content": "#1f2937", // Gray 800 - Dark text on neutral
          "base-100": "#1f2937", // Gray 800 - Base background for dark mode
          "base-200": "#111827", // Gray 900 - Darker base for sections
          "base-300": "#0f172a", // Slate 900 - Darkest sections
          "base-content": "#f9fafb", // Gray 50 - Light text for dark mode
          info: "#3b82f6", // Blue 500 - Info color
          success: "#10b981", // Emerald 500 - Success color
          warning: "#f59e0b", // Amber 500 - Warning color
          error: "#ef4444", // Red 500 - Error color
          "--rounded-btn": "0.5rem", // Rounded button style (more professional)
        },
      },
    ],
  },
  theme: {
    extend: {
      colors: {
        // Professional color palette with indigo as primary color
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        secondary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        // Neutral and UI colors
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        // Semantic colors
        success: "#10b981", // Emerald 500
        warning: "#f59e0b", // Amber 500
        error: "#ef4444",   // Red 500
        info: "#3b82f6",    // Blue 500
      },
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)", // Centered box shadow
        'soft-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 2px 5px 0 rgba(0, 0, 0, 0.05)',
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite", // Fast pulse animation
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      fontSize: {
        'xxs': '0.625rem', // 10px
      },
      borderRadius: {
        'soft': '0.375rem',
      },
    },
  },
};