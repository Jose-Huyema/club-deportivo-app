import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#5C121F",
        "primary-light": "#F1E1E4",
        accent: "#5C121F",
        "accent-light": "#F1E1E4",
        success: "#1F8F5F",
        "success-light": "#E3F3EA",
        warn: "#A0651B",
        "warn-light": "#FBF0DE",
        cream: "#F6F3EF",
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
