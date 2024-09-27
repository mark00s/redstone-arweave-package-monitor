//TODO: Set it trough ENV?
export const ORACLE_NODE_MANIFEST_URL: string = "https://raw.githubusercontent.com/redstone-finance/redstone-oracles-monorepo/refs/heads/main/packages/oracle-node/manifests/data-services/primary.json";
export const ARWEAVE_GRAPHQL_URL: string = "https://arweave-search.goldsky.com/graphql"
//TODO: Evaluate these gateways. Arweave is fast, but other are much slower.
export const ARWEAVE_DATA_HOST: string[] = [
    "arweave.net",
    'permagate.io',
    'ar-io.dev',
    'vevivofficial.xyz'
]

export const DELAY: number = 120 * 60 // in seconds
export const TIME_RANGE: number = 1 * 60 // in seconds