import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Retro Pixel-Art Pastel Palette
        retro: {
          // Sky Blues
          'sky-light': '#B0E0E6',
          'sky': '#87CEEB',
          'sky-dark': '#6BB3D9',

          // Pastel Purples
          'lavender': '#E6E6FA',
          'plum': '#DDA0DD',
          'lilac': '#C8A2C8',
          'thistle': '#D8BFD8',

          // Pastel Pinks
          'pink-light': '#FFC0CB',
          'pink': '#FFB3C1',
          'rose': '#FFB6C1',

          // Accent Colors
          'yellow': '#FFD700',
          'orange': '#FFA500',
          'coral': '#FF7F50',

          // Retro Greens
          'mint': '#98FF98',
          'aqua': '#7FFFD4',

          // Retro Backgrounds
          'cream': '#FFFAF0',
          'peach': '#FFDAB9',
          'beige': '#F5F5DC',
        },

        // Mapúa MCL Brand Colors (blended with retro palette)
        cardinal: {
          red: '#E52037',
          DEFAULT: '#E52037',
          retro: '#FF6B6B',
        },
        pink: {
          light: '#FFD6E0',
          DEFAULT: '#FFB3C1',
          dark: '#FF6B9D',
          retro: '#FFC0CB',
        },
        navy: {
          DEFAULT: '#1E3A8A',
          dark: '#0F172A',
          retro: '#4A90E2',
        },
        royal: {
          blue: '#3B82F6',
          DEFAULT: '#3B82F6',
        },
        gold: {
          DEFAULT: '#FFD700',
        },
        heart: {
          DEFAULT: '#FF4444',
        },

        // Neutral colors
        cream: '#FFF8F3',
        slate: {
          50: '#F1F5F9',
          100: '#E2E8F0',
          200: '#CBD5E1',
          300: '#94A3B8',
          400: '#64748B',
          500: '#475569',
          600: '#334155',
          700: '#1E293B',
          800: '#0F172A',
          900: '#020617',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        pixel: ['var(--font-pixel)', '"Press Start 2P"', 'cursive'],
        retro: ['"Press Start 2P"', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 8px 0 0 #1E3A8A',
        'card-hover': '0 16px 0 0 #1E3A8A',
        'button': '0 6px 0 0 #1E3A8A',
        'button-active': '0 2px 0 0 #1E3A8A',
        'tv': '8px 8px 0 0 #FF6B9D, 12px 12px 0 0 #1E3A8A',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'heartbeat': 'heartbeat 2s ease-in-out infinite',
        'bob': 'bob 4s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.1)' },
          '50%': { transform: 'scale(0.9)' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.3)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
