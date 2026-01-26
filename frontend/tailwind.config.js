/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Figma-inspired color palette
        canvas: {
          DEFAULT: '#18191B',
          light: '#2C2D30',
          lighter: '#3C3D40',
        },
        panel: {
          DEFAULT: '#2C2D30',
          light: '#3A3B3E',
          lighter: '#45464A',
          border: '#4D4D4D',
        },
        accent: {
          blue: '#0D99FF',
          purple: '#7B61FF',
          pink: '#FF1CF7',
          green: '#00D4AA',
        },
      },
      boxShadow: {
        'figma': '0 2px 14px rgba(0, 0, 0, 0.15)',
        'figma-lg': '0 4px 20px rgba(0, 0, 0, 0.25)',
        'figma-xl': '0 8px 32px rgba(0, 0, 0, 0.35)',
        'widget': '0 1px 3px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1)',
        'widget-hover': '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(13, 153, 255, 0.5)',
        'widget-selected': '0 0 0 2px #0D99FF, 0 4px 12px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.2s ease-out',
        'slideIn': 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'slideUp': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scaleIn': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 3s ease-in-out infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      transitionTimingFunction: {
        'figma': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      cursor: {
        'grab': 'grab',
        'grabbing': 'grabbing',
      },
    },
  },
  plugins: [],
}