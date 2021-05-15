const colors = require('tailwindcss/colors')
module.exports = {
	purge: [
		'./pages/**/*.{js,ts,jsx,tsx}',
		'./components/**/*.{js,ts,jsx,tsx}',
	],
	darkMode: false, // or 'media' or 'class'
	theme: {
		opacity: {
			0: '0',
			20: '0.2',
			40: '0.4',
			60: '0.6',
			80: '0.8',
			100: '1',
		},
		fontSize: {
			xs: '.75rem',
			sm: '.875rem',
			tiny: '.875rem',
			base: '1rem',
			lg: '1.125rem',
			xl: '1.25rem',
			'2xl': '1.5rem',
			'3xl': '1.875rem',
			'4xl': '2.25rem',
			'5xl': '3rem',
			'6xl': '4rem',
			'7xl': '5rem',
			't1-xl': '32px',
			't1-lg': '22px',
			't1-md': '15px',
			't1-sm': '13px',
			't1-xs': '12px',
			// 't1-xl': '28px',
			// 't1-lg': '18px',
			// 't1-md': '11px',
			// 't1-sm': '9px',
			// 't1-xs': '7px',
		},
		colors: {
			...colors,
			't1-gray': '#73808D', 
			't1-black': '#101214'
		}
	},
	variants: {
		extend: {},
	},
	plugins: [],
};