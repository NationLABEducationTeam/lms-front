/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';
import forms from '@tailwindcss/forms';
import aspectRatio from '@tailwindcss/aspect-ratio';
import animate from 'tailwindcss-animate';

export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'scroll-left': {
  				'0%': { transform: 'translateX(0)' },
  				'100%': { transform: 'translateX(-100%)' },
  			},
  			'scroll-right': {
  				'0%': { transform: 'translateX(-100%)' },
  				'100%': { transform: 'translateX(0)' },
  			},
        'float': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        'heartbeat': {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.1)' },
          '50%': { transform: 'scale(1)' },
          '75%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'scroll-left': 'scroll-left 30s linear infinite',
  			'scroll-right': 'scroll-right 30s linear infinite',
        'float': 'float 5s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
        // 대시보드 리디자인 색상 팔레트
        dashboard: {
          primary: '#3F5CF7',
          secondary: '#6C4EF8',
          accent: '#FB4E6A',
          success: '#34D399',
          warning: '#FBBF24',
          error: '#F87171',
          info: '#38BDF8',
          // 그라데이션 배경용 색상
          gradient: {
            from: '#3F5CF7',
            via: '#6C4EF8',
            to: '#8B5CF6',
          },
          // 카드 배경 색상
          card: {
            light: '#FFFFFF',
            dark: '#1F2937',
            accent: 'rgba(63, 92, 247, 0.08)',
          },
          // 텍스트 색상
          text: {
            primary: '#111827',
            secondary: '#4B5563',
            muted: '#9CA3AF',
            light: '#F9FAFB',
          }
        }
  		}
  	}
  },
  plugins: [
  	typography,
  	forms,
  	aspectRatio,
  	animate,
  	function({ addVariant }) {
  		addVariant('dashboard-layout', '.dashboard-layout &')
  	}
  ],
} 