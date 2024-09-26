export interface HttpResonseLike {
    statusCode: number
    body: any
}

export interface IdWithMetadata {
    id: string,
    signer: string
    timestamp: string
    token: string
    isSigned: boolean
}