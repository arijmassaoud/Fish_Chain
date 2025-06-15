/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  theme: {
    extend: {
      fontFamily: {
        // This creates the `font-inter` class you need.
        // It assumes you are importing the 'Inter' font via a service like Google Fonts.
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        fontFamily: {
				'inter': ['Inter', 'sans-serif'],
				'playfair': ['Playfair Display', 'serif'],
			},
		
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Ocean-inspired color palette
				ocean: {
					50: '#f0f9ff',
					100: '#e0f2fe',
					200: '#bae6fd',
					300: '#7dd3fc',
					400: '#38bdf8',
					500: '#0ea5e9',
					600: '#0284c7',
					700: '#0369a1',
					800: '#075985',
					900: '#0c4a6e',
				},
        slate: {
          800: '#1f2937',
        },
				marine: {
					50: '#ecfeff',
					100: '#cffafe',
					200: '#a5f3fc',
					300: '#67e8f9',
					400: '#22d3ee',
					500: '#06b6d4',
					600: '#0891b2',
					700: '#0e7490',
					800: '#155e75',
					900: '#164e63',
				},
				deep: {
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
				}
			},
			backgroundImage: {
				'ocean-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				'marine-gradient': 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #22d3ee 100%)',
				'deep-gradient': 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
				'hero-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0369a1 50%, #0891b2 75%, #22d3ee 100%)',
				'aurora-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
				'sunset-gradient': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
				'ocean-depth': 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 25%, #1d4ed8 50%, #2563eb 75%, #3b82f6 100%)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-20px)' }
				},
				'wave': {
					'0%': { transform: 'rotate(0deg)' },
					'10%': { transform: 'rotate(14deg)' },
					'20%': { transform: 'rotate(-8deg)' },
					'30%': { transform: 'rotate(14deg)' },
					'40%': { transform: 'rotate(-4deg)' },
					'50%': { transform: 'rotate(10deg)' },
					'60%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(0deg)' }
				},
				'fadeInUp': {
					'0%': {
						opacity: '0',
						transform: 'translateY(30px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slideInLeft': {
					'0%': {
						opacity: '0',
						transform: 'translateX(-50px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'slideInRight': {
					'0%': {
						opacity: '0',
						transform: 'translateX(50px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'scale-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.9)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'glow-pulse': {
					'0%, 100%': {
						boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
					},
					'50%': {
						boxShadow: '0 0 40px rgba(99, 102, 241, 0.8), 0 0 60px rgba(139, 92, 246, 0.6)'
					}
				},
				'shimmer': {
					'0%': {
						backgroundPosition: '-200% 0'
					},
					'100%': {
						backgroundPosition: '200% 0'
					}
				},
				'bounce-slow': {
					'0%, 100%': {
						transform: 'translateY(0)',
						animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
					},
					'50%': {
						transform: 'translateY(-25%)',
						animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
					}
				},
				'wiggle': {
					'0%, 7%': { transform: 'rotateZ(0)' },
					'15%': { transform: 'rotateZ(-15deg)' },
					'20%': { transform: 'rotateZ(10deg)' },
					'25%': { transform: 'rotateZ(-10deg)' },
					'30%': { transform: 'rotateZ(6deg)' },
					'35%': { transform: 'rotateZ(-4deg)' },
					'40%, 100%': { transform: 'rotateZ(0)' }
				},
				'zoom-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.5)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'slide-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(100px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'wave': 'wave 2s linear infinite',
				'fadeInUp': 'fadeInUp 0.8s ease-out',
				'slideInLeft': 'slideInLeft 0.8s ease-out',
				'slideInRight': 'slideInRight 0.8s ease-out',
				'scale-in': 'scale-in 0.5s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite',
				'bounce-slow': 'bounce-slow 3s infinite',
				'wiggle': 'wiggle 1s ease-in-out infinite',
				'zoom-in': 'zoom-in 0.6s ease-out',
				'slide-up': 'slide-up 0.8s ease-out'
			},
			boxShadow: {
				'glow': '0 0 20px rgba(99, 102, 241, 0.5)',
				'glow-lg': '0 0 40px rgba(99, 102, 241, 0.8)',
				'cyan-glow': '0 0 30px rgba(34, 211, 238, 0.5)',
				'purple-glow': '0 0 30px rgba(139, 92, 246, 0.5)',
				'aurora': '0 0 50px rgba(99, 102, 241, 0.3), 0 0 100px rgba(139, 92, 246, 0.2)',
			}
		}
      },



  plugins: [],
} 