import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: {
		  // Permitir servir archivos desde un nivel superior a la raíz del proyecto
		  allow: ['..', 'C:/Users/Migue/Desktop/SOS/Repositories/SOS2425-18/node_modules/@sveltejs/kit/src/runtime/client/'],
		},
	  },
});
