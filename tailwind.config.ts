import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			boxShadow: {
				soft: '0 8px 30px rgba(0,0,0,0.08)'
			}
		}
	},
	plugins: []
} satisfies Config;

