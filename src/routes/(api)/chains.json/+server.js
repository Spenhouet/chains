import fs from 'fs';
import { base } from '$app/paths';
import { error } from '@sveltejs/kit';
import axios from 'axios'
import { jsonResponse } from '$lib/utils/response';
import { readChain } from '../[id].json/+server';

export const prerender = true;

/** @returns {{id: number, path: string}[]} */
export function readChains() {
    const chainIds = fs.readdirSync(`./chains`, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => +dirent.name);

    if (!chainIds) {
        throw error(404, `No recorded chains found.`)
    }

    const chains = chainIds.map((id) => {
        const chain = readChain(id);
        return {
            id,
            path: chain.path
        }
    });

    return chains;
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
    const chains = readChains().sort((a, b) => a.id - b.id);

    return jsonResponse(chains);
}
