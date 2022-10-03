import { readChains } from './(api)/chains.json/+server';
import { readChain } from './(api)/[id].json/+server';

const PREFETCH = 20

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    /** @type {import('./(api)/[id].json/+server').Chain[]} */
    let chains = readChains().sort((a, b) => a.id - b.id)

    for (const chain of chains.slice(0, PREFETCH)) {
        Object.assign(chain, readChain(chain.id))
    }

    return { chains }
}
