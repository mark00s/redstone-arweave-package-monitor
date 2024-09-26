import { HttpResonseLike } from "./interfaces.js";

export async function GetJsonFromUrl(url: string, params = {}): Promise<HttpResonseLike> {
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

export function GetGraphQlTransactionsQuery(dataFeeds: string[], timestamps: string[]): string {
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