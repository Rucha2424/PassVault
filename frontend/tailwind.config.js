/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ultra-violet': {
          DEFAULT: '#6C3CE9',
          hover: '#5A2FD1',
          active: '#4E25B8',
          light: '#885DF5',
          deep: '#4923A6',
        },
        'soft-apricot': {
          DEFAULT: '#FFC9A9',
          light: '#FFE4D3',
          dark: '#F5A97D',
        },
        'warm-ivory': {
          DEFAULT: '#FFF9F5',
          dark: '#F9F1EB',
        },
        'soft-lavender': {
          DEFAULT: '#EEE7FF',
          dark: '#E2D6FF',
        },
        'deep-plum': {
          DEFAULT: '#2E2142',
          light: '#473663',
        },
        'muted-text': '#776B83',
        'vault-border': '#E9DFEE',
        'vault-success': '#24856B',
        'vault-warning': '#B76A20',
        'vault-error': '#C43D57',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(46, 33, 66, 0.05), 0 1px 2px rgba(46, 33, 66, 0.03)',
        'card': '0 4px 12px -2px rgba(46, 33, 66, 0.06), 0 2px 6px -1px rgba(46, 33, 66, 0.03)',
        'elevated': '0 10px 25px -4px rgba(108, 60, 233, 0.12), 0 6px 12px -2px rgba(46, 33, 66, 0.04)',
      },
      borderRadius: {
        'btn': '10px',
      }
    },
  },
  plugins: [],
}
