<script>
	import { base } from '$app/paths';
	import SvelteSeo from 'svelte-seo';
	import Table from '$lib/components/table.svelte';
	import Search from '$lib/components/search.svelte';

	/** @type {import('./$types').PageData} */
	export let data;

	let query = '';

	$: ({ chains } = data);
</script>

<SvelteSeo
	title="Chains: Wagmi compatible chain configurations"
	description="Wagmi compatible chain configurations compiled from ethereum-lists."
/>

<nav class="sticky top-0 z-10 bg-gray-200 bg-opacity-75 backdrop-blur backdrop-filter">
	<div
		class="flex justify-between space-x-2 h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-500"
	>
		<a href={base} class="flex">
			<div class="flex-shrink-0 flex items-center space-x-2">
				<img class="block h-8 w-8" src="{base}/logo.svg" alt="Chains Logo" />
				<div class="text-3xl uppercase hidden sm:block">Chains</div>
			</div>
		</a>
		<div class="flex-1 flex items-center justify-center lg:ml-6 lg:justify-end">
			<div class="w-full">
				<Search bind:query />
			</div>
		</div>
	</div>
</nav>
<main class="mt-5">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-500">
		<h1 class="text-3xl font-bold">Wagmi compatible chain configurations</h1>
		<p class="mt-2">
			Wagmi compatible chain configurations compiled from <a
				class="text-indigo-600 hover:text-indigo-900"
				href="https://github.com/ethereum-lists/chains">ethereum-lists</a
			>. Find the respective json configs below or via
			<a class="text-indigo-600 hover:text-indigo-900" href="{base}/chains.json">chains.json</a>,
			<a class="text-indigo-600 hover:text-indigo-900" href="{base}/chains.min.json"
				>chains.min.json</a
			>,
			<a class="text-indigo-600 hover:text-indigo-900" href="{base}/chains-full.json"
				>chains-full.json</a
			>
			or
			<a class="text-indigo-600 hover:text-indigo-900" href="{base}/chains-full.min.json"
				>chains-full.min.json</a
			>.
		</p>
	</div>
	<div class="mt-5 w-full mx-auto lg:mx-0 bg-gray-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-500">
			<Table
				data={chains}
				chunk={20}
				columns={[
					{ id: 'id', title: 'Chain ID', class: 'w-[17vw]' },
					{ id: 'name', title: 'Name', class: 'font-medium w-[30vw]' },
					{
						id: 'nativeCurrency',
						title: 'Native Currency',
						class: 'hidden md:table-cell w-[33vw]'
					},
					{
						id: 'config',
						title: 'Config',
						class: 'text-right w-[20vw]'
					}
				]}
				mapping={(chain) => ({
					id: { text: `${chain.id}`, value: chain.id },
					name: { text: chain.name, value: chain.name },
					nativeCurrency: {
						text: `${chain.nativeCurrency.name} (${chain.nativeCurrency.symbol})`,
						value: `${chain.nativeCurrency.name} (${chain.nativeCurrency.symbol})`
					},
					config: { text: chain.path, value: chain.path, href: chain.path }
				})}
				filter={query}
				class="bg-gray-50"
			/>
		</div>
	</div>
</main>
