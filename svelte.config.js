import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';

const dev = process.env.NODE_ENV === 'development';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		paths: {
			base: dev ? '' : '/chains',
		},
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			precompress: false
		}),

		prerender: {
			enabled: true,
		},
	},

	preprocess: [
		preprocess({
			scss: {
				prependData: '@use "src/variables.scss" as *;'
			},

			postcss: true,
			preserve: ['ld+json']
		})
	]
};

export default config;
