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

export function GenerateTimestamps(timeRange: number, delay: number, now: number): string[] {
    const nowRounded = now - (now % 10);
    const end = nowRounded - delay;
    const start = end - timeRange;

    var result: string[] = []

    for (var i = start; i < end; i += 10) {
        result.push(i.toString())
    }

    return result;
}

export function GetGraphQlTransactionsQuery(dataFeeds: string[], timestamps: string[], signerAddresses: string[]): string {
    return `
    query {
        transactions(
            first: 120
            tags: [
                { name: "type", values: ["redstone-oracles"] }
                { name: "dataServiceId", values: ["redstone-primary-prod"] }
                { name: "timestamp", values: ${JSON.stringify(timestamps)}, op: EQ }
                {
                    name: "signerAddress"
                    values: ${JSON.stringify(signerAddresses)}
                }
                { name: "dataFeedId", values: ${JSON.stringify(dataFeeds)} }
            ]
        ) {
        edges {
        node {
            id
            tags {
                name
                value
            }
        }
        }
    }
    }
  `
}