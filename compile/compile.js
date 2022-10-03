import axios from 'axios'
import fs from 'fs'
import yaml from 'yaml';
import psl from 'psl';
import sharp from 'sharp'

// TODO store date of successful execution
// TODO check reference repository if something is newer than last execution date, if yes pull
// TODO write daily GitHub action

const chainsDir = '../chains'

/** @typedef {{name: string, chain: string, icon: string, rpc: string[], faucets?: any[], nativeCurrency: {name: string, symbol: string, decimals: number}, infoURL?: string, shortName: string, chainId: number, networkId: number, slip44?: number, ens: {registry: string}, explorers?: {name: string, url: string, standard: string}[] }} Chain */

const chainsJsonUrl = 'https://chainid.network/chains.json'
const iconRoute = 'https://raw.githubusercontent.com/ethereum-lists/chains/master/_data/icons'
const ipfsGateway = 'https://ipfs.io'

/** @type {Chain[]} */
const chains = (await axios.get(chainsJsonUrl)).data

/**
 * @param {any} image 
 * @param {number} imageSize 
 * @param {string} filepath 
 */
function resizeAndStoreImage(image, imageSize, filepath) {
    sharp(image)
        .resize(imageSize, imageSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFile(`${filepath}/icon${imageSize}.png`);
}

/**
 * @param {string} cid 
 * @param {string} filepath 
 */
async function loadIconViaIpfs(cid, filepath) {
    const response = await axios.get(`${ipfsGateway}/ipfs/${cid}`, { responseType: 'arraybuffer', timeout: 2000 })
    if (response.status == 200) {
        const image = response.data
        resizeAndStoreImage(image, 16, filepath)
        resizeAndStoreImage(image, 32, filepath)
        resizeAndStoreImage(image, 64, filepath)
        resizeAndStoreImage(image, 128, filepath)
        resizeAndStoreImage(image, 256, filepath)
        resizeAndStoreImage(image, 512, filepath)
    } else {
        console.log(response);
    }
}

const rpcKeyMapping = {
    infura: 'infura.io',
    alchemy: 'alchemyapi.io',
}

/** 
 * @param {string[]} urls 
 * @return {{[key: string]: string}}
 */
function mapRpcKeys(urls) {
    urls = urls.filter((url) => url.includes('https://')) // Keep only https links
        .map((url) => url.replace(/\/\${.*}/g, '')) // Remove env vars

    const _urls = urls.reduce((d, url, i) => {
        let special_rpc = Object.entries(rpcKeyMapping).find(([key, domain]) => url.includes(domain))
        special_rpc = special_rpc ? special_rpc[0] : undefined
        let domain_match = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/g.exec(url)
        domain_match = domain_match ? psl.parse(domain_match[1]).sld : undefined
        return { ...d, [special_rpc || domain_match || i]: url }
    }, {})

    let non_special = Object.entries(_urls).find(([key, url]) => !(key in rpcKeyMapping))
    non_special = non_special ? non_special[1] : undefined
    if (non_special) {
        _urls['public'] = non_special
        _urls['default'] = non_special
    } else {
        _urls['default'] = urls[0]
    }

    return _urls
}

const explorerKeyMapping = {
    etherscan: 'scan.',
    blockscout: 'explorer.',
}

/** 
 * @param {{name: string, url: string, standard: string}[]} explorers 
 * @return {{[key: string]: {name: string, url: string, standard: string}}}
 */
function mapExplorerKeys(explorers) {
    const _explorers = explorers.reduce((d, c) => {
        let special_key = Object.entries(explorerKeyMapping).find(([key, domain]) => c.url.includes(domain))
        special_key = special_key ? special_key[0] : undefined
        let key = c.name.replace(' ', '-').toLocaleLowerCase()
        key = key.includes('etherscan') ? 'etherscan' : key
        return {
            ...d,
            [special_key || key]: {
                name: c.name.charAt(0).toUpperCase() + c.name.slice(1),
                url: c.url,
                standard: c.standard
            }
        }
    }, {})

    _explorers['default'] = { ...Object.values(_explorers)[0] }

    return _explorers
}

for (const chain of chains) {
    console.log(chain.chainId)
    const chainDir = `${chainsDir}/${chain.chainId}`
    fs.mkdirSync(`${chainsDir}/${chain.chainId}`, { recursive: true })

    try {
        if ('icon' in chain) {
            const response = await axios.get(`${iconRoute}/${chain.icon}.json`)
            if (response.status == 200) {
                const iconMeta = response.data[0]
                const cid = iconMeta.url.slice('ipfs://'.length)
                await loadIconViaIpfs(cid, chainDir)
            } else {
                console.log(response);
            }
        }
    } catch (err) {
        console.log(err.message)
    }

    const wagmiChainMeta = {
        id: chain.chainId,
        name: chain.name,
        shortName: chain.shortName,
        networkId: chain.networkId,
        network: chain.name.replace(' ', '-').toLocaleLowerCase(),
        chain: chain.chain,
        infoUrl: chain.infoURL || '',
        nativeCurrency: chain.nativeCurrency,
        rpcUrls: chain.rpc ? mapRpcKeys(chain.rpc) : {},
        blockExplorers: chain.explorers ? mapExplorerKeys(chain.explorers) : {},
        testnet: JSON.stringify(chain).toLowerCase().includes('testnet')
    }

    fs.writeFileSync(`${chainDir}/infos.yml`, yaml.stringify(wagmiChainMeta))
}


