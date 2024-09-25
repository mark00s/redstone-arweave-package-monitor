import { Context, Handler } from "aws-lambda";

//TODO: Set it trough ENV?
const ORACLE_NODE_MANIFEST_URL: string = "https://raw.githubusercontent.com/redstone-finance/redstone-oracles-monorepo/refs/heads/main/packages/oracle-node/manifests/data-services/primary.json";
const DELAY: number = 10 * 60 // in seconds
const TIME_RANGE: number = 1 * 60 // in seconds

export const lambdaHandler: Handler = async (event, context: Context) => {
    // console.log('EVENT: \n' + JSON.stringify(event, null, 2));

    const response = await getJsonFromUrl(ORACLE_NODE_MANIFEST_URL);
    if (response.statusCode != 200)
        return {
            statusCode: response.statusCode,
            body: JSON.stringify(response.body)
        }

    const tokens = Object.keys(response.body.tokens);
    // return context.logStreamName;
};

void main();

async function main() {
    console.log(`RUNNING`)
    const oracleResponse = await getJsonFromUrl(ORACLE_NODE_MANIFEST_URL);
    if (oracleResponse.statusCode != 200)
        return {
            statusCode: oracleResponse.statusCode,
            body: JSON.stringify(oracleResponse.body)
        }

    const tokens = Object.keys(oracleResponse.body.tokens);
    console.log(`RUNNING2`)

    const arweaveResponse = await getJsonFromUrl(ARWEAVE_GRAPHQL_URL, {
        method: 'POST',

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({ query: GetGraphQlTransactionsQuery(["ETH"], ["1727259010"]) })
    });

async function getJsonFromUrl(url: string, params = {}) {
    try {
        const response = await fetch(url, params);
        return {
            statusCode: response.status,
            body: await response.json(),
        }
    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            body: {
                message: `Unknown Error during getJsonFromUrl. Err: ${err}`
            },
        }
    }
}

function GetGraphQlTransactionsQuery(dataFeeds: string[], timestamps: string[]): string {
    return `
    query {
        transactions(
            first: 100
            tags: [
                { name: "type", values: ["redstone-oracles"] }
                { name: "dataServiceId", values: ["redstone-primary-prod"] }
                { name: "timestamp", values: ${JSON.stringify(timestamps)}, op: EQ }
                {
                    name: "signerAddress"
                    values: [
                    "0x8BB8F32Df04c8b654987DAaeD53D6B6091e3B774"
                    "0xdEB22f54738d54976C4c0fe5ce6d408E40d88499"
                    "0x51Ce04Be4b3E32572C4Ec9135221d0691Ba7d202"
                    "0xDD682daEC5A90dD295d14DA4b0bec9281017b5bE"
                    "0x9c5AE89C4Af6aA32cE58588DBaF90d18a855B6de"
                    ]
                }
                { name: "dataFeedId", values: ${JSON.stringify(dataFeeds)} }
            ]
        ) {
        edges {
        node {
            id
        }
        }
    }
    }
  `
}