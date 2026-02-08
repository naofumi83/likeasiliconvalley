/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'monospace'],
      },
      colors: {
        // Goodpatch Blue #096FCA ベース
        gp: {
          50: '#edf6ff',
          100: '#d7ecff',
          200: '#b8dcff',
          300: '#87c6ff',
          400: '#4ea5ff',
          500: '#2680ff',
          600: '#096FCA',  // Goodpatch コーポレートカラー
          700: '#0a5baa',
          800: '#0e4d8c',
          900: '#134273',
          950: '#0c2a4b',
        },
        accent: {
          light: '#4db5ff',  // ライトアクセント
          DEFAULT: '#096FCA',
          dark: '#064e91',
        },
        neon: {
          blue: '#3da0ff',    // GPブルーの明るいバリエーション
          sky: '#5ec5ff',     // スカイブルー（SFの空）
          white: '#e8f4ff',   // ほぼ白のブルーティント
          green: '#00c853',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #040c18 0%, #0a1f3d 25%, #0d2e5c 50%, #0a1f3d 75%, #040c18 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(9,111,202,0.05) 0%, rgba(9,111,202,0.02) 100%)',
        'accent-gradient': 'linear-gradient(135deg, #5ec5ff 0%, #096FCA 50%, #064e91 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(9, 111, 202, 0.2)',
        'glow-lg': '0 0 40px rgba(9, 111, 202, 0.25)',
        'glow-soft': '0 0 30px rgba(9, 111, 202, 0.1)',
      },
      animation: {
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: theme('colors.gray.700'),
            a: {
              color: '#096FCA',
              '&:hover': { color: '#0a5baa' },
            },
          },
        },
        invert: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: '#5ec5ff',
              '&:hover': { color: '#87c6ff' },
            },
            h1: { color: theme('colors.gray.100') },
            h2: { color: theme('colors.gray.100') },
            h3: { color: theme('colors.gray.100') },
            h4: { color: theme('colors.gray.100') },
            strong: { color: theme('colors.gray.100') },
            blockquote: {
              color: theme('colors.gray.400'),
              borderLeftColor: '#096FCA',
            },
            code: { color: '#5ec5ff' },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
