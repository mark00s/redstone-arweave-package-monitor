import { Context, Handler } from "aws-lambda";

export const lambdaHandler: Handler = async (event, context: Context) => {
    console.log('EVENT: \n' + JSON.stringify(event, null, 2));
    return context.logStreamName;
};