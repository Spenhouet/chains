import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';

const dev = process.env.NODE_ENV === 'development';
// When deployed under a different domain this needs change.
const baseRoute = dev ? '' : '/chains'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		paths: {
			base: baseRoute,
		},
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: baseRoute,
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
