import { DataPackage, DataPoint, recoverSignerAddress, SignedDataPackage } from "@redstone-finance/protocol";
import { getOracleRegistryState, getSignersForDataServiceId } from "@redstone-finance/sdk";
import { Context, Handler } from "aws-lambda";
import { ARWEAVE_GRAPHQL_URL, ORACLE_NODE_MANIFEST_URL } from "./etc/constants.js";
import { GetGraphQlTransactionsQuery, GetJsonFromUrl } from "./etc/helpers.js";



export const lambdaHandler: Handler = async (event, context: Context) => {
    // console.log('EVENT: \n' + JSON.stringify(event, null, 2));

    const response = await GetJsonFromUrl(ORACLE_NODE_MANIFEST_URL);
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
    const oracleResponse = await GetJsonFromUrl(ORACLE_NODE_MANIFEST_URL);

    if (oracleResponse.statusCode != 200)
        return {
            statusCode: oracleResponse.statusCode,
            body: JSON.stringify(oracleResponse.body)
        }

    const tokens = Object.keys(oracleResponse.body.tokens);

    const arweaveResponse = await GetJsonFromUrl(ARWEAVE_GRAPHQL_URL, {
        method: 'POST',

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({ query: GetGraphQlTransactionsQuery(["ETH"], ["1727259010"]) })
    });

    if (arweaveResponse.statusCode != 200)
        return {
            statusCode: arweaveResponse.statusCode,
            body: JSON.stringify(arweaveResponse.body)
        }

    var edges: { "node": { "id": string } }[] = arweaveResponse.body['data']['transactions']['edges']

    var urls: string[] = []
    edges.forEach(edge => urls.push(`https://arweave.net/${edge.node.id}`))

    const oracleRegistry = await getOracleRegistryState();
    const redstonePrimaryNodesAddresses = getSignersForDataServiceId(oracleRegistry, "redstone-primary-prod");

    urls.forEach(async url => {
        const jsonBody = (await GetJsonFromUrl(url)).body;
        const signedDataPkg = SignedDataPackage.fromObj(jsonBody);
        const signerAddress = recoverSignerAddress(signedDataPkg);
        if (redstonePrimaryNodesAddresses.includes(signerAddress))
            console.log(`YES: ${url}`)
        else
            console.log(`NO: ${url}`)
    })
}
