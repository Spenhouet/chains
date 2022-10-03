import fs from 'fs';
import { error } from '@sveltejs/kit';
import { jsonResponse, minJsonResponse } from '$lib/utils/response';
import { readChain } from '../[id].json/+server';

export const prerender = true;

/** 
 * @param {boolean} fullLoad
 * @returns {{id: number, path: string}[]} 
 */
export function readChains(fullLoad = false) {
    const chainIds = fs.readdirSync(`./chains`, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => +dirent.name);

    if (!chainIds) {
        throw error(404, `No recorded chains found.`)
    }

    const chains = chainIds.map((id) => {
        const chain = readChain(id)
        return fullLoad ? chain : {
            id,
            path: chain.path
        }
    });

    return chains;
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
    const minJson = params.type.includes('.min')
    const fullLoad = params.type.includes('-full')

    const chains = readChains(fullLoad).sort((a, b) => a.id - b.id);

    return minJson ? minJsonResponse(chains) : jsonResponse(chains);
}
