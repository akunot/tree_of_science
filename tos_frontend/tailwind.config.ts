/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary color - Cyan/Turquoise
        primary: '#19c3e6',
        'primary-50': 'rgba(25, 195, 230, 0.05)',
        'primary-10': 'rgba(25, 195, 230, 0.1)',
        'primary-20': 'rgba(25, 195, 230, 0.2)',
        'primary-30': 'rgba(25, 195, 230, 0.3)',

        // Background colors
        'background-light': '#f6f8f8',
        'background-dark': '#111e21',
        'forest': '#1a2e05',

        // Slate variations
        'slate': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },

        // Additional semantic colors
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'info': '#3b82f6',
      },

      fontFamily: {
        sans: ["'Space Grotesk'", 'system-ui', '-apple-system', 'sans-serif'],
        display: ["'Space Grotesk'", 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },

      fontSize: {
        // Aumentar tamaños base para landing pages
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
      },

      fontWeight: {
        thin: '300',
        light: '400',
        normal: '500',
        semibold: '600',
        bold: '700',
      },

      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '0.125rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },

      boxShadow: {
        // Glow shadows
        'glow-primary': '0 0 20px rgba(25, 195, 230, 0.3)',
        'glow-primary-sm': '0 0 15px rgba(25, 195, 230, 0.2)',
        'glow-primary-lg': '0 0 30px rgba(25, 195, 230, 0.4)',
        'glow-inner': 'inset 0 0 15px rgba(25, 195, 230, 0.1)',

        // Default shadows
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

        // Dark glass effect
        'glass-dark': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      },

      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },

      spacing: {
        // Additional spacing for larger components
        18: '4.5rem',
        20: '5rem',
        28: '7rem',
        36: '9rem',
        44: '11rem',
        52: '13rem',
        60: '15rem',
        72: '18rem',
      },

      backgroundImage: {
        // Gradients
        'gradient-radial': 'radial-gradient(circle at 50% 50%, rgba(25, 195, 230, 0.15) 0%, rgba(17, 30, 33, 0) 70%)',
        'gradient-to-br-dark': 'linear-gradient(to bottom right, #111e21, #0a0e10)',
        'gradient-cian': 'linear-gradient(135deg, #19c3e6 0%, #0ea5e9 100%)',
      },

      keyframes: {
        // Custom animations
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'slide-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          'from': { opacity: '0', transform: 'translateY(-20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          'from': { opacity: '0', transform: 'translateX(20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          'from': { opacity: '0', transform: 'translateX(-20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },

      animation: {
        // Use custom animations
        float: 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'slide-in-left': 'slide-in-left 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'shimmer': 'shimmer 3s ease-in-out infinite',
      },

      transitionDuration: {
        fast: '150ms',
        DEFAULT: '300ms',
        slow: '500ms',
        slower: '700ms',
      },

      transitionTimingFunction: {
        'ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },

      opacity: {
        5: '0.05',
        10: '0.1',
        20: '0.2',
        30: '0.3',
        40: '0.4',
        50: '0.5',
        60: '0.6',
        70: '0.7',
        75: '0.75',
        80: '0.8',
        90: '0.9',
        95: '0.95',
      },

      // Aspect ratios
      aspectRatio: {
        auto: 'auto',
        square: '1 / 1',
        video: '16 / 9',
        '4/3': '4 / 3',
        '21/9': '21 / 9',
      },

      // Line heights
      lineHeight: {
        '3': '.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
      },

      // Letter spacing
      letterSpacing: {
        'tighter': '-0.05em',
        'tight': '-0.025em',
        'normal': '0em',
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.1em',
        'widest-2': '0.2em',
      },

      // Word spacing
      wordSpacing: {
        'tight': '-0.05em',
        'normal': '0em',
        'wide': '0.1em',
      },

      // Max widths
      maxWidth: {
        '7xl': '80rem',
        '8xl': '88rem',
        'screen-sm': '640px',
        'screen-md': '768px',
        'screen-lg': '1024px',
        'screen-xl': '1280px',
      },

      // Z-index
      zIndex: {
        auto: 'auto',
        hide: '-1',
        0: '0',
        10: '10',
        20: '20',
        30: '30',
        40: '40',
        50: '50',
        dropdown: '1000',
        sticky: '1020',
        fixed: '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    // Custom plugin para glass effect
    function ({ addComponents, theme }) {
      addComponents({
        '.glass-card': {
          '@apply bg-white/5 backdrop-blur-md border border-white/5 rounded-xl': {},
          'background': 'rgba(25, 195, 230, 0.05)',
          'backdrop-filter': 'blur(12px)',
          'border': '1px solid rgba(25, 195, 230, 0.1)',
        },
        '.glass-card-hover': {
          '@apply glass-card hover:border-primary/30 transition-all': {},
        },
        '.glass-nav': {
          'backdrop-filter': 'blur(8px)',
          'background': 'rgba(17, 30, 33, 0.8)',
        },
        '.btn-primary': {
          '@apply px-8 py-4 bg-primary text-background-dark font-bold rounded-lg transition-all hover:scale-105 shadow-glow-primary active:scale-95': {},
        },
        '.btn-secondary': {
          '@apply px-8 py-4 border border-white/10 font-bold rounded-lg hover:bg-white/5 transition-all text-slate-100 active:bg-white/10': {},
        },
        '.btn-ghost': {
          '@apply px-4 py-2 text-sm font-medium hover:text-primary transition-colors': {},
        },
      });
    },
  ],
};