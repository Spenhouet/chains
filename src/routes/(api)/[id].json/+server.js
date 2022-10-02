import fs from 'fs';
import { parse } from 'yaml';
import { base } from '$app/paths';
import { error } from '@sveltejs/kit';
import { jsonResponse } from '$lib/utils/response';

export const prerender = true;

/** @typedef {{id: number, path: string, name: string, shortName: string, networkId: number, network: string, chain: string, infoURL?: string, rpcUrls: {[key: string]: string}, nativeCurrency: {name: string, symbol: string, decimals: number}, ens?: {registry: string}, blockExplorers?: {[key: string]: {name: string, url: string, standard: string}}, testnet: boolean, icons: {[key: number]: string} }} Chain */

/** 
 * @param {number} id
 * @returns {Chain} 
 */
export function readChain(id) {
    let chain = parse(fs.readFileSync(`./chains/${id}/infos.yml`, 'utf-8'));

    if (!chain) {
        throw error(404, `Chain id=${id} infos not found.`)
    }

    return {
        id,
        path: `${base}/${id}.json`,
        ...chain,
        icons: {} // TODO set icon paths
    }
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
    const chain = readChain(params.id);

    return jsonResponse(chain);
}
