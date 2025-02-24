import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'admin-nav': '#E5ECF6',
        'dark-sidebar': '#3C3C3C',
        'dark-text': '#ECECEC',
        'outline': '#E8E8E8',
        'selected-corlor': '#E2ECF1',
        'custom-red': '#FF5E5E',
        'custom-blue': '#DAEFFF',
        'dark-body': '#444444',
        'dark-selected': '#4A4A4A',
        'dark-outline': '#555555',
      },
    },
  },
  plugins: [],
};
export default config;
