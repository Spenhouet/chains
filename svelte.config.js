import fs from 'fs';
import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';

// TODO copy icons to static folder

const chainIds = fs.readdirSync(`./chains`, { withFileTypes: true })
	.filter(dirent => dirent.isDirectory())
	.map(dirent => +dirent.name);

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
			fallback: 'index.html',
			precompress: false
		}),

		prerender: {
			enabled: true,
			entries: [
				'*',
				'/',
				...chainIds.map((id) => `/${id}.json`),
				'/chains.json'
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
