/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fef3f2',
                    100: '#fee5e2',
                    200: '#fecfca',
                    300: '#fcada5',
                    400: '#f87c71',
                    500: '#ef4444',
                    600: '#e02020',
                    700: '#bc1616',
                    800: '#9b1717',
                    900: '#7f1919',
                    950: '#450809',
                },
                brand: {
                    red: '#FF2D55',
                    orange: '#FF6B35',
                    purple: '#7C3AED',
                    blue: '#3B82F6',
                    dark: '#0F0F0F',
                    darker: '#080808',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'hero-gradient': 'linear-gradient(135deg, #0F0F0F 0%, #1a0a2e 50%, #0F0F0F 100%)',
                'card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                'brand-gradient': 'linear-gradient(135deg, #FF2D55 0%, #FF6B35 100%)',
                'purple-gradient': 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s infinite',
                'float': 'float 3s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
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
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(255, 45, 85, 0.4)' },
                    '100%': { boxShadow: '0 0 20px rgba(255, 45, 85, 0.8), 0 0 40px rgba(255, 45, 85, 0.4)' },
                },
            },
            boxShadow: {
                'glass': '0 8px 32px rgba(0, 0, 0, 0.37)',
                'card': '0 4px 24px rgba(0, 0, 0, 0.2)',
                'brand': '0 4px 20px rgba(255, 45, 85, 0.4)',
                'purple': '0 4px 20px rgba(124, 58, 237, 0.4)',
                'glow-red': '0 0 20px rgba(255, 45, 85, 0.5)',
                'glow-purple': '0 0 20px rgba(124, 58, 237, 0.5)',
            },
        },
    },
    plugins: [],
}
