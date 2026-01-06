/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'tw-',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '300' }],
        sm: ['0.875rem', { lineHeight: '1.25', letterSpacing: '0.025em', fontWeight: '300' }],
        base: ['1rem', { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '300' }],
        lg: ['1.125rem', { lineHeight: '1.75', letterSpacing: '0.01em', fontWeight: '300' }],
        xl: ['1.25rem', { lineHeight: '1.75', letterSpacing: '0.01em', fontWeight: '400' }],
        '2xl': ['1.5rem', { lineHeight: '2', letterSpacing: '0.01em', fontWeight: '400' }],
        '3xl': ['1.875rem', { lineHeight: '2.25', letterSpacing: '-0.01em', fontWeight: '500' }],
        '4xl': ['2.25rem', { lineHeight: '2.5', letterSpacing: '-0.02em', fontWeight: '500' }],
        '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '600' }],
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '600' }],
        '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '700' }],
        '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.04em', fontWeight: '700' }],
        '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.04em', fontWeight: '700' }],
      },
      fontFamily: {
        heading: ["Cormorant Garamond", "serif"],
        paragraph: ["Lato", "sans-serif"]
      },
      colors: {
        'soft-gold': '#A9927D',
        destructive: '#D32F2F',
        'destructive-foreground': '#FFFFFF',
        background: '#F9F9F9',
        secondary: '#777777',
        foreground: '#333333',
        'secondary-foreground': '#FFFFFF',
        'primary-foreground': '#FFFFFF',
        primary: '#333333',
        muted: '#F3F4F6',
        'muted-foreground': '#6B7280',
        border: '#E5E7EB',
        input: '#E5E7EB',
        ring: '#A9927D',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
  ],
};
