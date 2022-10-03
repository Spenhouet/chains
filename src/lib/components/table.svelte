<script>
	import { base } from '$app/paths';
	import { inview } from 'svelte-inview';
	import axios from 'axios';
	import { random } from '$lib/utils/string-formatting';
	import * as _ from 'lodash-es';

	let clazz = '';
	export { clazz as class };

	/** @type {any[]} */
	export let data;
	/** @type {number} */
	export let chunk;
	/** @type {{ id: string, title: string, class: string }[]} */
	export let columns;
	/** @type {(value: any) => {[key: string]: { text: string, value: string }}} */
	export let mapping;

	/** @type {string} */
	export let filter = '';

	/** @type {any[]} */
	export let rows = data.filter((d) => d.name).map((d) => mapping(d));

	$: length = rows.length;
	$: isLoading = rows.some((row) => row.placeholder === true);

	/** @type {{[key: string]: {mean: number, std: number}}} */
	$: columnLengths = columns.reduce((l, { id }) => {
		const rs = rows.slice(-chunk);
		const mean = _.meanBy(rs, (c) => c[id].text.length);
		if (id == 'placeholder') return l;
		return {
			...l,
			[id]: {
				mean,
				std: Math.sqrt(_.meanBy(rs, (c) => Math.pow(c[id].text.length - mean, 2)))
			}
		};
	}, {});

	function placeholderData() {
		return {
			...columns.reduce(
				(c, { id }) => ({
					...c,
					[id]: { text: random(columnLengths[id].mean, columnLengths[id].std), value: '' }
				}),
				{}
			),
			placeholder: true
		};
	}

	async function loadData() {}

	async function loadChunk() {
		const start = length;
		const end = Math.min(length + chunk, data.length);

		const placeholders = Array(end - start)
			.fill(null)
			.map(placeholderData);

		rows = [...rows, ...placeholders];

		let promises = [];
		for (let i = start - 1; i < end; i++) {
			const promise = axios.get(data[i].path).then(({ data }) => (rows[i] = mapping(data)));
			promises.push(promise);
		}
		await Promise.all(promises);
	}
</script>

<div class={clazz}>
	<table class="min-w-full divide-y divide-gray-300 border-separate table-fixed">
		<thead class="bg-gray-50">
			<tr>
				{#each columns as column}
					<th
						scope="col"
						class="sticky top-16 z-10 border-gray-300 bg-gray-50 bg-opacity-75 backdrop-blur backdrop-filter py-3.5 text-left text-sm font-semibold text-gray-900 transition-all duration-500 {column.class}"
					>
						<div class="inline-flex">
							{column.title}
						</div>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-200 bg-gray-50">
			{#each filter ? rows.filter((row) => JSON.stringify(row)
							.toLowerCase()
							.includes(filter.toLowerCase())) : rows as row}
				<tr class={row.placeholder ? 'animate-pulse blur' : ''}>
					{#each columns as column}
						<td
							class="whitespace-nowrap py-4 text-sm text-gray-900 transition-all duration-500 overflow-ellipsis {column.class}"
						>
							{#if row[column.id].href}
								<a
									href={row[column.id].href}
									target="_blank"
									class="text-indigo-600 hover:text-indigo-900"
								>
									{#if row[column.id].icon}
										<div class="flex items-center space-x-1">
											<img
												class="h-5 w-5 object-contain"
												src="{base}/{row[column.id].icon}"
												alt="Icon of {row[column.id].text}"
											/>
											<span>
												{row[column.id].text}
											</span>
										</div>
									{:else}
										<span>
											{row[column.id].text}
										</span>
									{/if}
								</a>
							{:else if row[column.id].icon}
								<div class="flex items-center space-x-1">
									<img
										class="h-5 w-5 object-contain"
										src="{base}/{row[column.id].icon}"
										alt="Icon of {row[column.id].text}"
									/>
									<span>
										{row[column.id].text}
									</span>
								</div>
							{:else}
								<span>
									{row[column.id].text}
								</span>
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
			{#if !isLoading}
				<div
					class="hiden"
					use:inview={{ threshold: 0, rootMargin: '50px 0px 0px 0px' }}
					on:enter={(event) => {
						if (event.detail.inView) {
							loadChunk();
						}
					}}
				/>
			{/if}
		</tbody>
	</table>
	{#if data.length == 0}
		<div class="py-4 max-w-3xl mx-auto text-center text-lg font-thin text-gray-500">
			There are no chains recorded yet. You can help add some <a
				href="https://github.com/ethereum-lists/chains"
				class="underline hover:text-blue-700">here</a
			>!
		</div>
	{/if}
</div>

<style>
	table {
		border-spacing: 0;
	}
</style>
