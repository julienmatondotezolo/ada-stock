/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ada Brand Colors
        'ada-blue': '#4d6aff',
        'ada-blue-light': '#8b98ff', 
        'ada-pink': '#ff66cc',
        
        // Functional Colors
        'ada-success': '#22c55e',
        'ada-warning': '#f59e0b', 
        'ada-error': '#ef4444',
        
        // Backgrounds
        'ada-bg-primary': '#eff4f8',
        'ada-bg-secondary': '#ffffff',
        'ada-bg-accent': '#f8fafc',
        
        // Text
        'ada-text-primary': '#33373b',
        'ada-text-secondary': '#6b7280',
        'ada-text-muted': '#9ca3af',
      },
      fontSize: {
        'ada-4xl': '2.25rem',
        'ada-3xl': '1.875rem', 
        'ada-2xl': '1.5rem',
        'ada-xl': '1.25rem',
        'ada-base': '1rem',
        'ada-sm': '0.875rem',
        'ada-xs': '0.75rem',
      },
      spacing: {
        'ada-1': '0.25rem',
        'ada-2': '0.5rem', 
        'ada-3': '0.75rem',
        'ada-4': '1rem',
        'ada-6': '1.5rem',
        'ada-8': '2rem',
        'ada-12': '3rem',
        'ada-16': '4rem',
      },
      borderRadius: {
        'ada-sm': '0.25rem',
        'ada-md': '0.5rem',
        'ada-lg': '0.75rem', 
        'ada-xl': '1rem',
      }
    },
  },
  plugins: [],
}