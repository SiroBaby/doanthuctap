/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/.{js,ts,jsx,tsx,mdx}",
      "./app/*.{js,ts,jsx,tsx,mdx}",
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./app/**/\\(auth\\)/**/*.{js,ts,jsx,tsx,mdx}",
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
      "./*.{js,ts,jsx,tsx,mdx}",
   
      // Or if using `src` directory:
      "./src/**/*.{html,js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        colors: {
          'outline': '#E8E8E8',
          'left_anothertopbar': '#00D2E4',
          'right_anothertopbar': '#00E3CD',
        },
        backgroundImage: {
            'gradient-radial': 'radial-gradient(var(--gradient-stops))',
            'gradient-conic': 'conic-gradient(var(--gradient-stops))',
          },
          colors: {
            'left-anothertopbar': '#00D2E4',
            'right-anothertopbar': '#00E3CD',
          },
      },
    },

    plugins: [],
  }