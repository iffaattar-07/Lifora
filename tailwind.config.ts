import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F5F8F6',
          100: '#E7EFEA',
          200: '#CEDFD4',
          300: '#AEC9B8',
          400: '#8AAFA7',
          500: '#69957F',
          600: '#507663',
          700: '#3D5B4C',
          800: '#2C4137',
          900: '#1D2C25',
        },
        teal: {
          50: '#F0F7F6',
          100: '#D7ECE9',
          200: '#AFD9D4',
          300: '#7EBFB9',
          400: '#4FA19A',
          500: '#2E847D',
          600: '#1F6B65',
          700: '#17544F',
          800: '#134440',
          900: '#0E3330',
          950: '#07211F',
        },
        ivory: {
          50: '#FCFAF7',
          100: '#F8F5EE',
          200: '#EFE9DC',
          300: '#E3D9C4',
          400: '#CEBEA0',
          500: '#B5A07A',
        },
        care: {
          taken: '#16A34A',
          missed: '#DC2626',
          upcoming: '#D97706',
          scheduled: '#2563EB',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-inter)',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        serif: [
          'var(--font-merriweather)',
          'Georgia',
          'Cambria',
          'serif',
        ],
      },
      boxShadow: {
        'soft-card': '0 2px 10px -2px rgba(19, 68, 64, 0.05), 0 4px 16px -2px rgba(19, 68, 64, 0.03)',
        'elevated': '0 8px 30px -4px rgba(19, 68, 64, 0.08), 0 4px 12px -2px rgba(19, 68, 64, 0.04)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
