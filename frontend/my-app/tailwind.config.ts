import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "admin-nav": "#E5ECF6",
        "dark-sidebar": "#3C3C3C",
        "dark-text": "#ECECEC",
        outline: "#E8E8E8",
        "selected-corlor": "#E2ECF1",
        "custom-red": "#FF5E5E",
        "custom-blue": "#DAEFFF",
        "dark-body": "#444444",
        "dark-selected": "#4A4A4A",
        "dark-outline": "#555555",
        "left-anothertopbar": "#00D2E4",
        "right-anothertopbar": "#00E3CD",
        voucher: "rgba(0, 227, 205, 0.17)",
        button: "#1FBFEB",
        "button-shopping": "#1FBFEB",
        "button-loc": "#F9F871",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--gradient-stops))",
        "gradient-conic": "conic-gradient(var(--gradient-stops))",
        "gradient-to-tr":
          "linear-gradient(to top right, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        ".shadow-text": {
          textShadow: "1px 1px 1px rgba(0, 0, 0, 0.5)",
        },
      };
      addUtilities(newUtilities);
    }),
  ],
};

export default config;
