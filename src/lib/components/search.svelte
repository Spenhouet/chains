<script>
	import { SearchIcon, XCircleIcon } from '@rgossiaux/svelte-heroicons/solid';

	let clazz = '';
	export { clazz as class };

	/** @type {string} */
	export let query = '';

	function clearQuery() {
		query = '';
	}
</script>

<div class="relative">
	<label for="search" class="sr-only">Search</label>
	<input
		id="search"
		name="search"
		class="block w-full pl-10 pr-3 py-2 rounded-md leading-5 bg-gray-50 focus:bg-white caret-gray-400 focus:outline-none focus:ring-1 focus:ring-transparent border border-gray-300 focus:border-gray-400 sm:text-sm {clazz}"
		type="search"
		autoComplete="none"
		bind:value={query}
	/>
	<div class="absolute inset-y-0 left-0 pl-3 flex items-center space-x-2 pointer-events-none">
		<SearchIcon class="h-5 w-5 text-gray-500" aria-hidden="true" />
		{#if !query}
			<span class="text-gray-500 tracking-tighter sm:hidden">Search chain</span>
			<span class="hidden text-gray-500 tracking-tighter sm:block"
				>What chain are you looking for?</span
			>
		{/if}
	</div>
	<div class="absolute inset-y-0 right-0 pr-3 flex items-center" on:click={clearQuery}>
		<XCircleIcon
			class={query
				? 'h-5 w-5 cursor-pointer text-gray-500 hover:outline-none hover:text-neon-pink'
				: 'hidden'}
			aria-hidden="true"
		/>
	</div>
</div>

<style>
	input[type='search']::-webkit-search-decoration,
	input[type='search']::-webkit-search-cancel-button,
	input[type='search']::-webkit-search-results-button,
	input[type='search']::-webkit-search-results-decoration {
		-webkit-appearance: none;
	}
</style>
