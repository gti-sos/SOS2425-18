import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

console.log("SE esta ejecutando o no el vite!!!!!!!!");
export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/temp-api': {
				target: 'https://sos2425-15.onrender.com',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/temp-api/, '/api/v1/temperature-stats')
			}
		},
		fs: {
			allow: [
				'..', // permite el directorio actual
				'../../'
			]
		},
	}
});
