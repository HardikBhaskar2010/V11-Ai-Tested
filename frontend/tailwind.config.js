/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#2E7D32',
          DEFAULT: '#2E7D32',
          dark: '#4CAF50',
        },
        secondary: {
          light: '#1976D2',
          DEFAULT: '#1976D2', 
          dark: '#42A5F5',
        },
        accent: {
          light: '#FF6F00',
          DEFAULT: '#FF6F00',
          dark: '#FFB74D',
        },
        success: {
          light: '#388E3C',
          dark: '#66BB6A',
        },
        warning: {
          light: '#F57C00',
          dark: '#FFB74D',
        },
        surface: {
          light: '#FAFAFA',
          dark: '#121212',
        },
        card: {
          light: '#FFFFFF',
          dark: '#1E1E1E',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0,-8px,0)' },
          '70%': { transform: 'translate3d(0,-4px,0)' },
          '90%': { transform: 'translate3d(0,-2px,0)' },
        }
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}