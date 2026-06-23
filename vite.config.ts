import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter()
		})
	],
	server: {
		// Windows: MP3 в static часто locked (браузер, AV, копирование) → EBUSY роняет dev-сервер
		watch: {
			ignored: [
				'**/static/**/*.mp3',
				'**/static/**/*.MP3',
				'**/static/**/*.wav',
				'**/static/**/*.WAV',
				'**/static/**/*.ogg',
				'**/static/**/*.OGG',
				'**/static/**/*.m4a',
				'**/static/**/*.M4A',
				'**/static/**/*.aac',
				'**/static/**/*.AAC',
				'**/static/**/*.flac',
				'**/static/**/*.FLAC',
				'**/static/**/*.opus',
				'**/static/**/*.OPUS',
				'**/static/**/*.webp',
				'**/static/**/*.WEBP',
				'**/static/**/*.jpg',
				'**/static/**/*.JPG',
				'**/static/**/*.jpeg',
				'**/static/**/*.JPEG',
				'**/static/**/*.png',
				'**/static/**/*.PNG',
				'**/static/**/*.gif',
				'**/static/**/*.GIF',
				'**/static/**/*.svg',
				'**/static/**/*.SVG',
				'**/static/**/*.txt',
				'**/static/**/*.TXT',
				'**/static/**/*.md',
				'**/static/**/*.MD'
			]
		}
	}
});
