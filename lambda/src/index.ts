import { recoverSignerAddress, SignedDataPackage } from "@redstone-finance/protocol";
import { getOracleRegistryState, getSignersForDataServiceId } from "@redstone-finance/sdk";
import { Context, Handler } from "aws-lambda";
import { ARWEAVE_DATA_HOST, ARWEAVE_GRAPHQL_URL, DELAY, ORACLE_NODE_MANIFEST_URL, TIME_RANGE } from "./etc/constants.js";
import { GenerateTimestamps, GetGraphQlTransactionsQuery, GetJsonFromUrl } from "./etc/helpers.js";
import { IdWithMetadata } from "./etc/interfaces.js";

var IterateHosts: number = 0;


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
    //TODO: Move it to lambdaHandler before deployment on AWS.
    const dateNowSeconds = ((new Date).getTime() / 1000);
    const timestamps = GenerateTimestamps(TIME_RANGE, DELAY, dateNowSeconds);
    const oracleRegistry = await getOracleRegistryState();
    const redstonePrimaryNodesAddresses = getSignersForDataServiceId(oracleRegistry, "redstone-primary-prod");

    const oracleResponse = await GetJsonFromUrl(ORACLE_NODE_MANIFEST_URL);
    if (oracleResponse.statusCode != 200)
        return {
            statusCode: oracleResponse.statusCode,
            body: JSON.stringify(oracleResponse.body)
        }

    const tokens = Object.keys(oracleResponse.body.tokens);

    for (var token of tokens) {
        console.log(`Starting to work on ${token}`)
        var validPackages = 0;
        var expectedPackages = 0;

        for (const timestamp of timestamps) {
            console.log(`Starting to work on ${timestamp}`)
            expectedPackages += redstonePrimaryNodesAddresses.length
            var ids = await getIdsWithMetadata(timestamp, redstonePrimaryNodesAddresses, token);

            for (var signer of redstonePrimaryNodesAddresses) {
                if (IsPackageFromSigner(ids, signer)) {
                    validPackages++;
                }
                else {
                    console.warn(`Didn't find proper package for token ${token} on timestamp: ${timestamp}.`)
                }
            }
        }

        if ((validPackages / expectedPackages) * 100 < 99) {
            turnAlarmOn();
        }
    }
}

//TODO: CW Integration
function turnAlarmOn() {
    console.warn("EOEOEOEOEO");
}


function IsPackageFromSigner(ids: IdWithMetadata[], signer: string): boolean {
    for (var id of ids) {
        if (id.signer === signer && id.isSigned)
            return true;
    }

    console.warn(`Didn't find proper package for signer ${signer}.`)

    return false;
}

async function isPackageSigned(id: string, redstonePrimaryNodesAddresses: string[]): Promise<boolean> {
    const url = `https://${ARWEAVE_DATA_HOST[IterateHosts]}/${id}`
    try {
        const response = await GetJsonFromUrl(url);
        // TODO: Throw error if not 200

        const signedDataPkg = SignedDataPackage.fromObj(response.body);
        const signerAddress = recoverSignerAddress(signedDataPkg);

        return redstonePrimaryNodesAddresses.includes(signerAddress)
    } catch (error) {
        console.log(`ERROR: ${error}`)
        IterateHosts++;
        //TODO: Beautify it. It is antipattern to recurrence in `catch` block.
        //TODO: Check for error type. There can be more than TIMEOUT. response.statusCode?
        if (IterateHosts === ARWEAVE_DATA_HOST.length)
            throw new RangeError(`Run out of the Data Hosts? Iterator: ${IterateHosts} Length: ${ARWEAVE_DATA_HOST.length}`);

        return isPackageSigned(id, redstonePrimaryNodesAddresses);
    }
}

async function getIdsWithMetadata(timestamp: string, signerAddresses: string[], token: string): Promise<IdWithMetadata[]> {
    const arweaveResponse = await GetJsonFromUrl(ARWEAVE_GRAPHQL_URL, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({ query: GetGraphQlTransactionsQuery([token], [timestamp], signerAddresses) })
    });
    // TODO: Throw error if not 200

    const edges = arweaveResponse.body['data']['transactions']['edges'];

    const promiseEdges = edges.map(async (edge: any) => {
        const id = edge['node']['id'];
        const signer = findSignerFromTags(edge['node']['tags']);
        const isSigned = await isPackageSigned(id, signerAddresses);

        return { id, signer, timestamp, token, isSigned };
    });

    return await Promise.all(promiseEdges);;
}

function findSignerFromTags(tags: { name: string, value: string }[]): string {
    for (var tag of tags) {
        if (tag.name === "signerAddress")
            return tag.value;
    }

    return "";
}