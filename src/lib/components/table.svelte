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
	let targetLength = rows.length;

	async function loadData() {
		targetLength = length + chunk;
		for (const { id, path } of data.slice(length, targetLength)) {
			const rowData = (await axios.get(path)).data;
			rows = [...rows, mapping(rowData)];
		}
		targetLength = length;
	}

	$: columnLengths = columns.reduce((l, { id }) => {
		const rs = rows.slice(-chunk);
		const mean = _.meanBy(rs, (c) => c[id].text.length);
		return {
			...l,
			[id]: {
				mean,
				std: Math.sqrt(_.meanBy(rs, (c) => Math.pow(c[id].text.length - mean, 2)))
			}
		};
	}, {});
</script>

<!-- divide-y divide-gray-300 -->
<!-- class="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 bg-opacity-75 backdrop-blur backdrop-filter py-3.5 pl-4 sm:pl-6 lg:pl-8 pr-1 text-left text-sm font-semibold text-gray-900 transition-all duration-500 {column.class}" -->

<!-- <div class="mt-8 flex flex-col">
	<div class="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
		<div class="inline-block min-w-full py-2 align-middle">
			<div class="shadow-sm ring-1 ring-black ring-opacity-5"> -->
<div class={clazz}>
	<table class="min-w-full divide-y divide-gray-300 border-separate table-fixed">
		<thead class="bg-gray-50">
			<tr>
				{#each columns as column}
					<th
						scope="col"
						class="sticky top-16 z-10 border-gray-300 bg-gray-50 bg-opacity-75 backdrop-blur backdrop-filter py-3.5 pl-4 sm:pl-6 lg:pl-8 pr-1 text-left text-sm font-semibold text-gray-900 transition-all duration-500 {column.class}"
					>
						<div class="inline-flex">
							{column.title}
						</div>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-200 bg-gray-50">
			{#each filter ? rows.filter((row) => JSON.stringify(row).includes(filter)) : rows as row}
				<tr>
					{#each columns as column}
						<td
							class="whitespace-nowrap py-4 pl-4 pr-1 text-sm text-gray-900 sm:pl-6 lg:pl-8 transition-all duration-500 {column.class}"
						>
							{#if column.link}
								<a
									href={row[column.id + '-path'].text}
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
							{:else}
								<div class="flex items-center space-x-1">
									{#if row[column.id].icon}
										<img
											class="h-5 w-5 object-contain"
											src="{base}/{row[column.id].icon}"
											alt="Icon of {row[column.id].text}"
										/>
									{/if}
									<span>
										{row[column.id].text}
									</span>
								</div>
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
			{#if length < targetLength}
				{#each [...Array(targetLength - length).keys()] as i}
					<tr class="animate-pulse blur">
						{#each columns as column}
							<td
								class="whitespace-nowrap py-4 pl-4 pr-1 text-sm text-gray-900 sm:pl-6 lg:pl-8 transition-all duration-500 {column.class}"
							>
								{random(columnLengths[column.id].mean, columnLengths[column.id].std)}
							</td>
						{/each}
					</tr>
				{/each}
			{:else}
				<div
					class="hiden"
					use:inview={{ threshold: 0, rootMargin: '50px 0px 0px 0px' }}
					on:enter={(event) => {
						if (event.detail.inView) {
							loadData();
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
