import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Customize your theme here
      colors: {
        // Example: Add your brand colors
        // brand: {
        //   50: '#f0fdf4',
        //   500: '#22c55e',
        //   900: '#14532d',
        // },
      },
    },
  },
  plugins: [typography],
};

export default config;
