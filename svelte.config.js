import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';

const TARGET = process.env.npm_lifecycle_event;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		paths: {
			base: TARGET === 'dev' ? '' : '/chains',
		},
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			precompress: false
		}),

		prerender: {
			enabled: true,
			entries: [
				'*',
				'/',
			]
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
